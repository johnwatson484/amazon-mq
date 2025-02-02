import { Connection, ReceiverEvents } from 'rhea-promise'

const host = process.env.ACTIVEMQ_HOST
const username = process.env.USERNAME
const password = process.env.PASSWORD
const port = '5671'
const senderAddress = 'demo-topic'

const connectionOptions = {
  transport: 'tls',
  host,
  hostname: host,
  username,
  password,
  port,
  reconnect: false
}

async function sendMessage () {
  const connection = new Connection(connectionOptions)

  await connection.open()

  const sender = await connection.createAwaitableSender({
    name: 'sender-1',
    target: {
      address: senderAddress
    },
  })
  const delivery = await sender.send({ body: 'Hello world' }, {
    timeoutInSeconds: 10
  })

  console.log(`Message sent: ${delivery.id}`)

  await sender.close()
  await connection.close()
}

async function receiveMessages () {
  const connection = new Connection(connectionOptions)
  const receiverName = 'receiver-1'
  const receiverOptions = {
    name: receiverName,
    source: {
      address: senderAddress
    },
    onSessionError: (context) => {
      const sessionError = context.session?.error
      if (sessionError) {
        console.log(">>>>> [%s] An error occurred for session of receiver '%s': %O.",
          connection.id, receiverName, sessionError)
      }
    }
  }

  await connection.open()
  const receiver = await connection.createReceiver(receiverOptions)
  receiver.on(ReceiverEvents.message, (context) => {
    console.log('Received message: %O', context.message)
  })
  receiver.on(ReceiverEvents.receiverError, (context) => {
    const receiverError = context.receiver?.error
    if (receiverError) {
      console.log(">>>>> [%s] An error occurred for receiver '%s': %O.",
        connection.id, receiverName, receiverError)
    }
  })

  await new Promise((resolve) => setTimeout(resolve, 5000))

  await receiver.close()
  await connection.close()
}

await sendMessage()
await receiveMessages()
