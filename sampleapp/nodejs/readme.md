# General Configuration
1. Setup new namespace "sampleapp"
   ```bash
   kubectl create namespace sampleapp
   kubectl config set-context --current --namespace sampleapp
   ```
2. Install mariadb
   ```bash
   helm repo add bitnami https://charts.bitnami.com/bitnami
   helm repo update
   helm install mariadb bitnami/mariadb
   ```
3. Take note the host & username & password of mariadb
   ```bash
   MYUSR=root
   MYPASS=$(kubectl get secret --namespace sampleapp mariadb -o jsonpath="{.data.mariadb-root-password}" | base64 -d)
   MYHOST="mariadb.sampleapp.svc.cluster.local"
   ```
# Build, Deploy & Update the app
## traefik/whoami App
Will be accesible on http://whoami.localhost, steps to deploy:
1. Prepare `deployment-whoami.yaml`, as follow:
   ```yaml
   apiVersion: apps/v1
   kind: Deployment
   metadata:
     name: whoami # Name of the deployment
     namespace: sampleapp # Name of the namespace
     labels:
       app: whoami # Name of your application
   spec:
     selector:
       matchLabels:
         app: whoami # Name of your application
     replicas: 1 # Number of replicas
     template:
       metadata:
         labels:
           app: whoami # Name of your application
       spec:
         containers:
         # Containers are the individual pieces of your application that you want
         # to run.
         - name: whoami
           image: traefik/whoami # The image you want to run
           imagePullPolicy: IfNotPresent
           ports:
           - containerPort: 80 # The port that your application uses
           resources:
             limits:
               memory: 512Mi
               cpu: "1"
             requests:
               memory: 256Mi
               cpu: "0.2"
   ---
   apiVersion: v1
   kind: Service
   metadata:
     name:  whoami
     namespace: sampleapp
   spec:
     selector:
       app:  whoami
     type:  ClusterIP
     ports:
     - name:  http
       port:  80
   ---
   apiVersion: traefik.io/v1alpha1
   kind: IngressRoute
   metadata:
     namespace: sampleapp
     name: whoami
   spec:
     entryPoints:
       - web
     routes:
       - match: Host(`whoami.localhost`)
         kind: Rule
         services:
           - name: whoami
             kind: Service
             port: 80
   ```
2. kjdhd
   ```bash
   kubectl apply -f deployment-whoami.yaml
   ```
## nodejs App
Will be accesible on http://nodejs.localhost, steps to deploy:
1. Start registry service locally
   ```bash
   docker run -d -p 5000:5000 --restart always --name registry registry:2
   ```
2. Initial build and deployment
   - Prepare `deployment-nodejs.yaml`, as follow:
     ```yaml
     apiVersion: apps/v1
     kind: Deployment
     metadata:
       name: sampleapp-nodejs # Name of the deployment
       namespace: sampleapp # Name of the namespace
       labels:
         app: sampleapp-nodejs # Name of your application
     spec:
       selector:
         matchLabels:
           app: sampleapp-nodejs # Name of your application
       replicas: 1 # Number of replicas
       template:
         metadata:
           labels:
             app: sampleapp-nodejs # Name of your application
         spec:
           containers:
           # Containers are the individual pieces of your application that you want
           # to run.
           - name: sampleapp-nodejs # Name of the container
             image: localhost:5000/sampleapp-nodejs # The image you want to run
             imagePullPolicy: IfNotPresent
             ports:
             - containerPort: 8080 # The port that your application uses
             resources:
               limits:
                 memory: 512Mi
                 cpu: "1"
               requests:
                 memory: 256Mi
                 cpu: "0.2"
     ---
     apiVersion: v1
     kind: Service
     metadata:
       name:  sampleapp-nodejs
       namespace: sampleapp
     spec:
       selector:
         app:  sampleapp-nodejs
       type:  ClusterIP
       ports:
       - name:  http
         port:  8080
     ---
     apiVersion: traefik.io/v1alpha1
     kind: IngressRoute
     metadata:
       namespace: sampleapp
       name: sampleapp-nodejs
     spec:
       entryPoints:
         - web
       routes:
         - match: Host(`nodejs.localhost`)
           kind: Rule
           services:
             - name: sampleapp-nodejs
               kind: Service
               port: 8080
     ```
   - build and push the app to registry
     ```bash
     docker build -f Dockerfile-nodejs . -t localhost:5000/sampleapp-nodejs  -t sampleapp-nodejs
     docker push localhost:5000/sampleapp-nodejs
     ```
   - Deploy the app
     ```bash
     kubectl apply -f deployment-nodejs.yaml
     ```
  3. Code update
     After every code changes: build, publish image, the rollout
     ```bash
     docker build -f Dockerfile-nodejs . -t localhost:5000/sampleapp-nodejs  -t sampleapp-nodejs
     docker push localhost:5000/sampleapp-nodejs
     kubectl rollout restart deployment sampleapp-nodejs
     ```

<!-- ```text
Tip:

  Watch the deployment status using the command: kubectl get pods -w --namespace sampleapp -l app.kubernetes.io/instance=mariadb

Services:

  echo Primary: mariadb.sampleapp.svc.cluster.local:3306

Administrator credentials:

  Username: root
  Password : $(kubectl get secret --namespace sampleapp mariadb -o jsonpath="{.data.mariadb-root-password}" | base64 -d)

To connect to your database:

  1. Run a pod that you can use as a client:

      kubectl run mariadb-client --rm --tty -i --restart='Never' --image  docker.io/bitnami/mariadb:11.0.3-debian-11-r5 --namespace sampleapp --command -- bash

  2. To connect to primary service (read/write):

      mysql -h mariadb.sampleapp.svc.cluster.local -uroot -p my_database

To upgrade this helm chart:

  1. Obtain the password as described on the 'Administrator credentials' section and set the 'auth.rootPassword' parameter as shown below:

      ROOT_PASSWORD=$(kubectl get secret --namespace sampleapp mariadb -o jsonpath="{.data.mariadb-root-password}" | base64 -d)
      helm upgrade --namespace sampleapp mariadb oci://registry-1.docker.io/bitnamicharts/mariadb --set auth.rootPassword=$ROOT_PASSWORD
``` -->