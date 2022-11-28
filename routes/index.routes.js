'use strict'
require('dotenv').config()
const router = require('express').Router()
const WhatsappCloudAPI = require('whatsappcloudapi_wrapper')
const Whatsapp = new WhatsappCloudAPI({
    accessToken: process.env.Meta_WA_accessToken,
    senderPhoneNumberId: process.env.Meta_WA_SenderPhoneNumberId,
    WABA_ID: process.env.Meta_WA_wabaId,
    graphAPIVersion: 'v13.0',
})
const EcommerceStore = require('../api/produkToko')
let Store = new EcommerceStore()
const CustomerSession = new Map()

router.get('/webhook', (req, res) => {
    try {
        console.log('GET: Webhook its works')

        let mode = req.query['hub.mode']
        let token = req.query['hub.verify_token']
        let challenge = req.query['hub.challenge']

        if (
            mode &&
            token &&
            mode === 'subscribe' &&
            process.env.Meta_WA_VerifyToken === token
        ) {
            return res.status(200).send(challenge)
        } else {
            return res.sendStatus(403)
        }
    } catch (error) {
        console.error({ error })
        return res.sendStatus(500)
    }
})

router.post('/webhook', async (req, res) => {
    console.log('POST: Webhook its works')
    try {
        let data = Whatsapp.parseMessage(req.body)
        if (data?.isMessage) {
            let incomingMessage = data.message
            let recipientPhone = incomingMessage.from.phone
            let recipientName = incomingMessage.from.name
            let typeOfMsg = incomingMessage.type
            let message_id = incomingMessage.message_id

            // Start of cart logic
            if (!CustomerSession.get(recipientPhone)) {
                CustomerSession.set(recipientPhone, {
                    cart: [],
                })
            }

            let addToCart = async ({ product_id, recipientPhone }) => {
                let product = await Store.getProductById(product_id)
                if (product.status === 'success') {
                    CustomerSession.get(recipientPhone).cart.push(product.data)
                }
            }

            let listOfItemsInCart = ({ recipientPhone }) => {
                let total = 0
                let products = CustomerSession.get(recipientPhone).cart
                total = products.reduce(
                    (acc, product) => acc + product.price,
                    total,
                )
                let count = products.length
                return { total, products, count }
            }

            let clearCart = ({ recipientPhone }) => {
                CustomerSession.get(recipientPhone).cart = []
            }
            // End of cart logic

            if (typeOfMsg === 'text_message') {
                await Whatsapp.sendSimpleButtons({
                    message: `Hallo ${recipientName}, \nKamu terhubung dengan virtual assistant PT Maju Engga Mundur Mundur\nBtw Kamu mau ngapain yah?`,
                    recipientPhone: recipientPhone,
                    listOfButtons: [
                        {
                            title: 'Lihat Produk',
                            id: 'see_categories',
                        },
                        {
                            title: 'Chat ke CS',
                            id: 'speak_to_human',
                        },
                    ],
                })
            }

            if (typeOfMsg === 'radio_button_message') {
                let selectionId = incomingMessage.list_reply.id

                if (selectionId.startsWith('product_')) {
                    let product_id = selectionId.split('_')[1]
                    let product = await Store.getProductById(product_id)
                    const {
                        price,
                        title,
                        description,
                        category,
                        image: imageUrl,
                        rating,
                    } = product.data

                    let emojiRating = (rvalue) => {
                        rvalue = Math.floor(rvalue || 0) // generate as many star emojis as whole ratings
                        let output = []
                        for (var i = 0; i < rvalue; i++) output.push('⭐')
                        return output.length ? output.join('') : 'N/A'
                    }

                    let text = `_Produk_: *${title.trim()}*\n\n\n`
                    text += `_Deskripsi_: ${description.trim()}\n\n\n`
                    text += `_Harga_: $${price}\n`
                    text += `_Kategori_: ${category}\n`
                    text += `${
                        rating?.count || 0
                    } Yang lain juga menyukai ini kok.\n`
                    text += `_Rated_: ${emojiRating(rating?.rate)}\n`

                    await Whatsapp.sendImage({
                        recipientPhone,
                        url: imageUrl,
                        caption: text,
                    })

                    await Whatsapp.sendSimpleButtons({
                        message: `Nah, ini produknya, skrang kamu mau ngapain ?`,
                        recipientPhone: recipientPhone,
                        message_id,
                        listOfButtons: [
                            {
                                title: 'Tambahin ke keranjang🛒',
                                id: `add_to_cart_${product_id}`,
                            },
                            {
                                title: 'Chat ke CS',
                                id: 'speak_to_human',
                            },
                            {
                                title: 'Lihat produk lain',
                                id: 'see_categories',
                            },
                        ],
                    })
                }
            }

            if (typeOfMsg === 'simple_button_message') {
                let button_id = incomingMessage.button_reply.id

                if (button_id === 'speak_to_human') {
                    // respond with a list of human resources
                    await Whatsapp.sendText({
                        recipientPhone: recipientPhone,
                        message: `Mau ngapain dah chat ke CS, mending pake virtual assistant aja sat set\n\nTapi yaudahdeh.\n\nJangan Spam yak\nIni No CS Kami`,
                    })

                    await Whatsapp.sendContact({
                        recipientPhone: recipientPhone,
                        contact_profile: {
                            addresses: [
                                {
                                    city: 'Bogor',
                                    country: 'Indonesia',
                                },
                            ],
                            name: {
                                first_name: 'Irfan',
                                last_name: 'Arifin',
                            },
                            org: {
                                company: 'Toko Maju Mundur',
                            },
                            phones: [
                                {
                                    phone: '+62 82116982479',
                                },
                                {
                                    phone: '+62 82116982479',
                                },
                            ],
                        },
                    })
                }
                if (button_id === 'see_categories') {
                    let categories = await Store.getAllCategories()

                    await Whatsapp.sendSimpleButtons({
                        message: `Kita punya beberapa kategori produk nih.\nSilahkan dipilih`,
                        recipientPhone: recipientPhone,
                        message_id,
                        listOfButtons: categories.data
                            .slice(0, 3)
                            .map((category) => ({
                                title: category,
                                id: `category_${category}`,
                            })),
                    })
                }

                if (button_id.startsWith('category_')) {
                    let selectedCategory = button_id.split('category_')[1]
                    let listOfProducts = await Store.getProductsInCategory(
                        selectedCategory,
                    )

                    let listOfSections = [
                        {
                            title: `🏆 Top 3: ${selectedCategory}`.substring(
                                0,
                                24,
                            ),
                            rows: listOfProducts.data
                                .map((product) => {
                                    let id = `product_${product.id}`.substring(
                                        0,
                                        256,
                                    )
                                    let title = product.title.substring(0, 21)
                                    let description =
                                        `${product.price}\n${product.description}`.substring(
                                            0,
                                            68,
                                        )

                                    return {
                                        id,
                                        title: `${title}...`,
                                        description: `$${description}...`,
                                    }
                                })
                                .slice(0, 10),
                        },
                    ]

                    await Whatsapp.sendRadioButtons({
                        recipientPhone: recipientPhone,
                        headerText: `#Penawaran Special: ${selectedCategory}`,
                        bodyText: `Ini ada promo buat kamu.\n\nSilahkan dipilih`,
                        footerText: 'ini slogan TOKO Maju mundur',
                        listOfSections,
                    })
                }

                if (button_id.startsWith('add_to_cart_')) {
                    let product_id = button_id.split('add_to_cart_')[1]
                    await addToCart({ recipientPhone, product_id })
                    let numberOfItemsInCart = listOfItemsInCart({
                        recipientPhone,
                    }).count

                    await Whatsapp.sendSimpleButtons({
                        message: `Keranjang belanja kamu sudah diupdate.\nJumlah produk dalam keranjang belanja: ${numberOfItemsInCart}.\n\nSekarang mau ngapain?`,
                        recipientPhone: recipientPhone,
                        message_id,
                        listOfButtons: [
                            {
                                title: 'Checkout 🛍️',
                                id: `checkout`,
                            },
                            {
                                title: 'Lihat produk lain',
                                id: 'see_categories',
                            },
                        ],
                    })
                }

                if (button_id === 'checkout') {
                    let finalBill = listOfItemsInCart({ recipientPhone })
                    let invoiceText = `Daftar Produk:\n`

                    finalBill.products.forEach((item, index) => {
                        let serial = index + 1
                        invoiceText += `\n#${serial}: ${item.title} @ $${item.price}`
                    })

                    invoiceText += `\n\nTotal: $${finalBill.total}`

                    Store.generatePDFInvoice({
                        order_details: invoiceText,
                        file_path: `./invoice_${recipientName}.pdf`,
                    })

                    await Whatsapp.sendText({
                        message: invoiceText,
                        recipientPhone: recipientPhone,
                    })

                    await Whatsapp.sendSimpleButtons({
                        recipientPhone: recipientPhone,
                        message: `Terima Kasih sudah belanja, ${recipientName}.\n\nPesanan kamu sudah kami terima dan akan segera diproses ya`,
                        message_id,
                        listOfButtons: [
                            {
                                title: 'Lihat Produk Lain',
                                id: 'see_categories',
                            },
                            {
                                title: 'Print Invoice Saya',
                                id: 'print_invoice',
                            },
                        ],
                    })

                    clearCart({ recipientPhone })
                }

                if (button_id === 'print_invoice') {
                    // Send the PDF invoice
                    await Whatsapp.sendDocument({
                        recipientPhone,
                        caption: `Invoice Toko Maju Mundur #${recipientName}`,
                        file_path: `./invoice_${recipientName}.pdf`,
                    })

                    // Send the location of our pickup station to the customer, so they can come and pick their order
                    let warehouse = Store.generateRandomGeoLocation()

                    await Whatsapp.sendText({
                        recipientPhone: recipientPhone,
                        message: `Pesanan kamu sudah siap, silahkan datang ke toko kami dan bayar disini yah`,
                    })

                    await Whatsapp.sendLocation({
                        recipientPhone,
                        latitude: warehouse.latitude,
                        longitude: warehouse.longitude,
                        address: warehouse.address,
                        name: 'Toko Maju Mundur',
                    })
                }
            }

            await Whatsapp.markMessageAsRead({
                message_id,
            })
        }

        return res.sendStatus(200)
    } catch (error) {
        console.error({ error })
        return res.sendStatus(500)
    }
})
module.exports = router
