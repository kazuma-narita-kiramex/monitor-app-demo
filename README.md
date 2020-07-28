# nuxt-app

`.env`をいい感じにしておく

```
cd nuxt-app
yarn install
yarn dev
```

# deploy

ECRへログインしておく
cdk.jsonのcontextを設定しておく

```
sh scripts/docker_build.sh
ECR_REPO=XXXXXXX sh scripts/docker_push.sh
npx cdk deploy --profile dev -c imageTag=yyyyyyy
```
