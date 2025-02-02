import amqp from 'amqplib'

const host = process.env.RABBITMQ_HOST
const username = process.env.USERNAME
const password = process.env.PASSWORD
const port = '5671'
const senderAddress = 'demo-topic'
const receiverAddress = 'demo-subscription'

async function sendMessage () {
  const connection = await amqp.connect(`amqps://${username}:${password}@${host}:${port}`)
  const channel = await connection.createChannel()
  await channel.publish(senderAddress, '', Buffer.from('Hello World!'))
  console.log('Message sent')
  await channel.close()
  await connection.close()
}

async function receiveMessages () {
  const connection = await amqp.connect(`amqps://${username}:${password}@${host}:${port}`)
  const channel = await connection.createChannel()
  channel.consume(receiverAddress, (message) => {
    console.log('Received message:', message.content.toString())
  }, { noAck: true })

  await new Promise((resolve) => setTimeout(resolve, 5000))

  await channel.close()
  await connection.close()
}

await sendMessage()
await receiveMessages()
