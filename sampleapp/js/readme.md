```bash
docker build -f Dockerfile-js . -t localhost:5000/sampleapp-js  -t sampleapp-js
docker push localhost:5000/sampleapp-js
kubectl rollout restart deployment sampleapp-js
```