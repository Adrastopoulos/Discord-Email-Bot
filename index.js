const Discord = require('discord.js')
const client = new Discord.Client()

var { MailListener } = require('mail-listener6')

const { username, password, host, port, token, channel } = require('./config.json')

client.once('ready', () => {
    console.log('Discord Email Bot Ready.')
})

client.login(token)

let mailListener = new MailListener({
  username,
  password,
  host,
  port,
  tls: true,
  tlsOptions: {
      rejectUnauthorized: false
  }
});

start()

function start() {
  mailListener.start()

  mailListener.on('server:connected', function() {
    console.log('imap connected')
  })
  
  mailListener.on('mailbox', function(mailbox) {
    console.log('Number of mails:', mailbox.messages.total)
  })
  
  mailListener.on("server:disconnected", function() {
    console.log("imap disconnected");
    console.log('imap restarting...')
    start()
  });
  
  mailListener.on("error", function(err){
    console.log(err);
    console.log('imap restarting...')
    start()
  });
  
  mailListener.on("mail", function(mail, seqno) {

    //Limit length to 2048 characters 
    let msg
    if(mail.content.length < 2048) {
      msg = mail.content
    } else {
      msg = `**See full email in attached file.**\n\n${mail.content.substring(0, 2000)}`
    }
    
    const mailEmbed = new Discord.MessageEmbed()
        .setColor('#0099ff')
        .setTitle(mail.subject)
        .setDescription(msg)
        .setAuthor(mail.from.value[0].name, client.user.displayAvatarURL())
        .setFooter(`${mail.from.value[0].address}`)
        .setTimestamp()   
    client.channels.cache.get(channel).send('\n**Full Email**', {
        embed: mailEmbed,
        files: [ new Discord.MessageAttachment(Buffer.from(mail.text, 'utf-8'), 'full_email.txt') ]
    })
  })  
}
