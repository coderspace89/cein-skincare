FROM node:20-alpine
ENV NODE_ENV=production

WORKDIR /opt/
COPY package.json package-lock.json ./
RUN npm install

WORKDIR /opt/app
COPY . .
RUN NODE_OPTIONS="--max-old-space-size=2048" npm run build
EXPOSE 1337

CMD ["npm", "run", "start"]