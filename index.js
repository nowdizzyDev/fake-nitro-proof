const { Client, GatewayIntentBits, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, AttachmentBuilder, ContainerBuilder, TextDisplayBuilder, MediaGalleryBuilder, MediaGalleryItemBuilder, SeparatorBuilder, MessageFlags } = require('discord.js');
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const config = require('./config.json');
const emoji = require('./emoji.json');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers
  ]
});

function generateTimeRange() {
  const now = new Date();
  const randomMinutes = Math.floor(Math.random() * 6) + 2;
  const newTime = new Date(now.getTime() + randomMinutes * 60000);
  const formatTime = (date) => date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  const formatDate = (date) => date.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  return {
    timestamp1: formatTime(now),
    timestamp2: formatTime(newTime),
    fullDate: formatDate(now)
  };
}

function escapeHtml(text) {
  return text.replace(/</g, '').replace(/>/g, '').replace(/script/gi, '');
}

client.once('ready', () => {
  console.log(`✅ Bot hazır: ${client.user.tag}`);
  client.user.setActivity(config.presence, { type: 0 });
});

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isCommand()) return;

  if (interaction.commandName === 'proof') {
    if (interaction.user.id !== config.ownerId) {
      return interaction.reply({ content: `${emoji.noPerms} Bu komutu kullanma yetkin yok.`, ephemeral: true });
    }
    const modal = new ModalBuilder()
      .setCustomId('nitroProofModal')
      .setTitle('Nitro Proof Generator');

    const gifterIdInput = new TextInputBuilder()
      .setCustomId('gifterId')
      .setLabel('1. Kullanıcı ID (boş = kendin)')
      .setPlaceholder('123456789012345678')
      .setStyle(TextInputStyle.Short)
      .setRequired(false);

    const receiverIdInput = new TextInputBuilder()
      .setCustomId('receiverId')
      .setLabel('2. Kullanıcı ID (boş = rastgele)')
      .setPlaceholder('123456789012345678')
      .setStyle(TextInputStyle.Short)
      .setRequired(false);

    const nitroDurationInput = new TextInputBuilder()
      .setCustomId('nitroDuration')
      .setLabel('Nitro Türü (1 month, 3 months, 1 year)')
      .setPlaceholder('1 month')
      .setStyle(TextInputStyle.Short)
      .setRequired(false)
      .setValue('1 month');

    const gifterMessageInput = new TextInputBuilder()
      .setCustomId('gifterMessage')
      .setLabel('1. Kullanıcı Mesajı')
      .setPlaceholder('Tebrikler! İşte nitron:')
      .setStyle(TextInputStyle.Short)
      .setRequired(false);

    const receiverMessageInput = new TextInputBuilder()
      .setCustomId('receiverMessage')
      .setLabel('2. Kullanıcı Mesajı')
      .setPlaceholder('OMG! Teşekkürler!')
      .setStyle(TextInputStyle.Short)
      .setRequired(true);

    modal.addComponents(
      new ActionRowBuilder().addComponents(gifterIdInput),
      new ActionRowBuilder().addComponents(receiverIdInput),
      new ActionRowBuilder().addComponents(nitroDurationInput),
      new ActionRowBuilder().addComponents(gifterMessageInput),
      new ActionRowBuilder().addComponents(receiverMessageInput)
    );

    await interaction.showModal(modal);
  }
});

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isModalSubmit()) return;
  if (interaction.customId !== 'nitroProofModal') return;

  await interaction.deferReply({ flags: MessageFlags.IsComponentsV2 });

  try {
    const gifterIdValue = interaction.fields.getTextInputValue('gifterId');
    const receiverIdValue = interaction.fields.getTextInputValue('receiverId');
    const nitroDurationValue = interaction.fields.getTextInputValue('nitroDuration') || '1 month';
    const gifterMessageValue = interaction.fields.getTextInputValue('gifterMessage');
    const receiverMessageValue = interaction.fields.getTextInputValue('receiverMessage');

    const durationMap = {
      '1 month':   { label: '1 month',  hours: 47 },
      '3 months':  { label: '3 months', hours: 47 },
      '6 months':  { label: '6 months', hours: 47 },
      '1 year':    { label: '1 year',   hours: 47 },
      '12 months': { label: '1 year',   hours: 47 },
    };
    const nitroInfo = durationMap[nitroDurationValue.toLowerCase().trim()] || { label: nitroDurationValue, hours: 47 };

    let gifter = interaction.user;
    if (gifterIdValue.trim()) {
      try { gifter = await client.users.fetch(gifterIdValue.trim()); } catch (err) {}
    }

    let receiver;
    if (receiverIdValue.trim()) {
      try {
        receiver = await client.users.fetch(receiverIdValue.trim());
      } catch (err) {
        const members = await interaction.guild.members.fetch();
        receiver = members.random().user;
      }
    } else {
      const members = await interaction.guild.members.fetch();
      receiver = members.random().user;
    }

    const gifterName = gifter.globalName || gifter.username;
    const receiverName = receiver.globalName || receiver.username;
    const gifterAvatar = gifter.displayAvatarURL({ extension: 'png', size: 128 });
    const receiverAvatar = receiver.displayAvatarURL({ extension: 'png', size: 128 });
    const gifterMessage = escapeHtml(gifterMessageValue || '');
    const receiverMessage = escapeHtml(receiverMessageValue);
    const times = generateTimeRange();

    let htmlContent = fs.readFileSync(path.join(__dirname, 'assets', 'nitroproof.html'), 'utf-8');

    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const giftCode = Array.from({ length: 16 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');

    htmlContent = htmlContent
      .replace(/GIFTER_USERNAME/g, gifterName)
      .replace(/RECEIVER_USERNAME/g, receiverName)
      .replace(/GIFTER_MESSAGE/g, gifterMessage ? gifterMessage + ' ' : '')
      .replace(/RECEIVER_MESSAGE/g, receiverMessage)
      .replace(/GIFTER_AVATAR_URL/g, gifterAvatar)
      .replace(/RECEIVER_AVATAR_URL/g, receiverAvatar)
      .replace(/TIMESTAMP_1/g, times.timestamp1)
      .replace(/TIMESTAMP_2/g, times.timestamp2)
      .replace(/FULL_DATE/g, times.fullDate)
      .replace(/NITRO_DURATION/g, nitroInfo.label)
      .replace(/EXPIRES_HOURS/g, nitroInfo.hours)
      .replace(/KJASNZXCJD/g, giftCode);

    const tempHtmlPath = path.join(__dirname, 'assets', 'temp.html');
    fs.writeFileSync(tempHtmlPath, htmlContent, 'utf-8');

    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 720, height: 600 });
    await page.goto('file://' + path.resolve(tempHtmlPath), { waitUntil: 'networkidle0' });

    const bodyHeight = await page.evaluate(() => document.body.scrollHeight);
    const screenshotPath = path.join(__dirname, 'proof.png');

    await page.screenshot({
      path: screenshotPath,
      clip: { x: 0, y: 0, width: 720, height: bodyHeight }
    });

    await browser.close();

    const attachment = new AttachmentBuilder(screenshotPath, { name: 'proof.png' });

    const container = new ContainerBuilder()
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent(`-# ${emoji.success} Nitro Proof • ${nitroInfo.label}`)
      )
      .addSeparatorComponents(new SeparatorBuilder())
      .addMediaGalleryComponents(
        new MediaGalleryBuilder().addItems(
          new MediaGalleryItemBuilder().setURL('attachment://proof.png')
        )
      );

    await interaction.editReply({
      components: [container],
      files: [attachment],
      flags: MessageFlags.IsComponentsV2
    });

    if (fs.existsSync(tempHtmlPath)) fs.unlinkSync(tempHtmlPath);
    if (fs.existsSync(screenshotPath)) fs.unlinkSync(screenshotPath);

  } catch (error) {
    console.error('Hata:', error);

    const errorContainer = new ContainerBuilder()
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent(`${emoji.error} Bir sorun oluştu. Lütfen girdiğiniz bilgileri kontrol edin.`)
      );

    await interaction.editReply({
      components: [errorContainer],
      flags: MessageFlags.IsComponentsV2
    });
  }
});

client.login(config.token);
