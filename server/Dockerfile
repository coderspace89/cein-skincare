FROM node:18-alpine
ENV NODE_ENV=production

WORKDIR /opt/
COPY package.json package-lock.json ./
RUN npm install

WORKDIR /opt/app
COPY . .
RUN npm run build
EXPOSE 1337

CMD ["npm", "run", "start"]