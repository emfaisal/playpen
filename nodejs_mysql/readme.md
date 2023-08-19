# Configure mysql
```bash
helm.exe repo add bitnami https://charts.bitnami.com/bitnami
```
```text
Tip:

  Watch the deployment status using the command: kubectl get pods -w --namespace mariadb -l app.kubernetes.io/instance=mariadb

Services:

  echo Primary: mariadb.mariadb.svc.cluster.local:3306

Administrator credentials:

  Username: root
  Password : $(kubectl get secret --namespace mariadb mariadb -o jsonpath="{.data.mariadb-root-password}" | base64 -d)

To connect to your database:

  1. Run a pod that you can use as a client:

      kubectl run mariadb-client --rm --tty -i --restart='Never' --image  docker.io/bitnami/mariadb:11.0.2-debian-11-r15 --namespace mariadb --command -- bash

  2. To connect to primary service (read/write):

      mysql -h mariadb.mariadb.svc.cluster.local -uroot -p my_database

To upgrade this helm chart:

  1. Obtain the password as described on the 'Administrator credentials' section and set the 'auth.rootPassword' parameter as shown below:

      ROOT_PASSWORD=$(kubectl get secret --namespace mariadb mariadb -o jsonpath="{.data.mariadb-root-password}" | base64 -d)
      helm upgrade --namespace mariadb mariadb oci://registry-1.docker.io/bitnamicharts/mariadb --set auth.rootPassword=$ROOT_PASSWORD
```
```bash
docker build . -t node-web-app
docker tag node-web-app localhost:5000/node-web-app
docker push localhost:5000/node-web-app
kubectl rollout restart deployment node-web-app
kubectl get pods
```