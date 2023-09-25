FROM node:18.18.0-alpine3.18

WORKDIR /usr/src/app

ENV NODE_ENV test

COPY ["package.json", "package-lock.json", "tsconfig.json", ".env.test",  ".env.development", "./"]

COPY ./src ./src

RUN npm ci

CMD npm run dev

