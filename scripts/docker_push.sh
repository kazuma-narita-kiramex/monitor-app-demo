#!/bin/bash

# 事前にECRログインする

# 環境変数でECRレポジトリを上書き出来る
repo=${ECR_REPO}

# イメージタグはデフォルトでgitコミットハッシュを使用
# 本スクリプトの引数で任意に指定出来る
commit_hash=$(git rev-parse --short HEAD)
tag=${1:-$commit_hash}
echo "image tag: $tag"

docker tag narita-monitor-app-demo:latest $repo:$tag
docker push $repo:$tag

docker tag narita-monitor-app-demo:latest $repo:latest
docker push $repo:latest
