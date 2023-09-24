FROM node:18.18.0-alpine3.18

WORKDIR /usr/src/app

COPY ["package.json", "package-lock.json", "tsconfig.json", ".env.test",  ".env.development", "./"]

COPY ./src ./src

RUN npm install

CMD npm run dev

