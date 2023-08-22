# Development environment in kubernetes (tested in docker-desktop)

## Overview
Once all has been executed, these links will be available:
- Traefik dashboard, http://traefik.localhost/dashboard/
- Kubernetes dashboard, https://kubernetes.localhost/
- Portainer dashboard, http://portainer.localhost/

To perform this installation, run the following preparation work:
```bash
helm repo add traefik https://traefik.github.io/charts
helm repo add portainer https://portainer.github.io/k8s/
helm repo list
helm repo update
```

## Setup

### Traefik
1. Prepare file `traefik-IngressRoute.yaml` with the following content: 
   ```yaml
   apiVersion: traefik.io/v1alpha1
   kind: IngressRoute
   metadata:
     namespace: traefik
     name: dashboard
   spec:
     entryPoints:
       - web
     routes:
       - match: Host(`traefik.localhost`) && (PathPrefix(`/dashboard`) || PathPrefix(`/api`))
         kind: Rule
         services:
           - name: api@internal
             kind: TraefikService
   ```
2. Install traefik
   ```bash
   kubectl create namespace traefik
   kubectl config set-context --current --namespace=traefik
   helm install traefik traefik/traefik
   kubectl apply -f traefik-IngressRoute.yaml
   ```
3. Traefik dashboard will be available in http://traefik.localhost/dashboard/.

### Kubernetes Dashboard
1. Prepare manifest `dashboard-ServiceAccount_ClusterRoleBinding_Secret.yaml` with the following content:
   ```yaml
   apiVersion: v1
   kind: ServiceAccount
   metadata:
     name: admin-user
     namespace: kubernetes-dashboard
   ---
   apiVersion: rbac.authorization.k8s.io/v1
   kind: ClusterRoleBinding
   metadata:
     name: admin-user
   roleRef:
     apiGroup: rbac.authorization.k8s.io
     kind: ClusterRole
     name: cluster-admin
   subjects:
   - kind: ServiceAccount
     name: admin-user
     namespace: kubernetes-dashboard
   ---
   apiVersion: v1
   kind: Secret
   metadata:
     name: admin-user
     namespace: kubernetes-dashboard
     annotations:
       kubernetes.io/service-account.name: "admin-user"   
   type: kubernetes.io/service-account-token
   ---
   apiVersion: traefik.io/v1alpha1
   kind: ServersTransport
   metadata:
     name: kubernetes-dashboard-transport
     namespace: kubernetes-dashboard
   spec:
     serverName: kubernetes-dashboard
     insecureSkipVerify: true
   ---
   apiVersion: traefik.io/v1alpha1
   kind: IngressRoute
   metadata:
     namespace: kubernetes-dashboard
     name: kubernetes-dashboard
   spec:
     entryPoints:
       - websecure
     routes:
       - match: Host(`kubernetes.localhost`)
         kind: Rule
         services:
           - name: kubernetes-dashboard
             kind: Service
             port: 443
             serversTransport: kubernetes-dashboard-transport
   ```
2. Apply it to the cluster
   ```yaml
   kubectl create namespace kubernetes-dashboard
   kubectl config set-context --current --namespace=kubernetes-dashboard
   kubectl apply -f https://raw.githubusercontent.com/kubernetes/dashboard/v2.7.0/aio/deploy/recommended.yaml
   kubectl apply -f dashboard-ServiceAccount_ClusterRoleBinding_Secret.yaml
   kubectl create token admin-user
   ```

The token for the dashboard can be generated with `kubectl get secret admin-user -n kubernetes-dashboard -o jsonpath={".data.token"} | base64 -d`, when prompted via as follow:
- https://kubernetes.localhost
- http://localhost:8001/api/v1/namespaces/kubernetes-dashboard/services/https:kubernetes-dashboard:/proxy/, after you run `kubectl proxy`
- https://localhost:8443/dashboard/, after you run `kubectl -n kubernetes-dashboard port-forward pods/kubernetes-dashboard-6967859bff-lw6p5 8443:8443`

### Portainer
1. Prepare ingress file `portainer-IngressRoute.yaml` as follow:
   ```yaml
   apiVersion: traefik.io/v1alpha1
   kind: ServersTransport
   metadata:
     name: portainer-transport
     namespace: portainer
   spec:
     serverName: portainer
     insecureSkipVerify: true
   ---
   apiVersion: traefik.io/v1alpha1
   kind: IngressRoute
   metadata:
     namespace: portainer
     name: portainer
   spec:
     entryPoints:
       - websecure
     routes:
       - match: Host(`portainer.localhost`)
         kind: Rule
         services:
           - name: portainer
             kind: Service
             port: 9443
             serversTransport: portainer-transport
   ```
2. Deploy portainer command as follow:
   ```bash
   kubectl create namespace portainer
   kubectl config set-context --current --namespace=portainer
   helm install portainer portainer/portainer --set service.type=ClusterIP
   kubectl apply -f portainer-IngressRoute.yaml
   ```
3. Please allow 1-2 minutes for storage creation, before portainer be available at http://portainer.localhost/.

## Using Development Environment
Conventions:
- Shared namespaces (`traefik` & `portainer`) is shared among developer
- Each developer uses his/her own name as namespace.
  ```bash
  kubectl create namespace efaisal
  ```
- Prepare deploymeny file `deployment-nginx.yml`, as follow:
  ```yaml
  ```
