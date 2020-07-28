FROM node:latest

RUN mkdir -p /nuxt-app
WORKDIR /nuxt-app
COPY ./ /nuxt-app
RUN  yarn install
RUN  yarn build

EXPOSE 80

ENTRYPOINT ["yarn", "start"]
