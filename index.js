const express = require('express')
const app = express()
const axios = require('axios')
const cheerio = require('cheerio')
const cors = require('cors')
require('dotenv').config()

app.use(cors())
// middleware xử lý boby , gửi dữ liệu lên server từ form
app.use(express.urlencoded({
    extended: true
}))
app.use(express.json())

// ROUTES
app.get('/v1', (req, res) => {
    try {
        const obj = []
        axios('https://kimetsu-no-yaiba.fandom.com/wiki/Kimetsu_no_Yaiba_Wiki')
            .then(response => {
                const html = response.data
                const $ = cheerio.load(html)
                // $(.testing)
                $('.portal', html).each(function () {
                    const name = $(this).find('a').attr('title')
                    const url = $(this).find('a').attr('href')
                    // đào img ở trong thẻ a
                    const image = $(this).find('a > img').attr('data-src')

                    obj.push({
                        name: name,
                        url: 'http://localhost:8000/v1' + url,
                        image: image
                    })
                })
                return res.status(200).json({ data: obj })
            })

    } catch (error) {
        return res.status(500).json({ error })
    }
})

app.get('/v1/wiki/:character', (req, res) => {
    const character = req.params.character
    const titles = []
    const details = []
    const objDetails = {}
    const galleries = []

    try {
        axios(`https://kimetsu-no-yaiba.fandom.com/wiki/${req.params.character}`)
            .then(response => {
                const html = response.data
                const $ = cheerio.load(html)

                //get gallery
                $('.wikia-gallery-item', html).each(function () {
                    const galleryImage = $(this).find('a > img').attr('data-src')
                    galleries.push(galleryImage)

                })

                $('aside', html).each(function () {
                    // get image 
                    const image = $(this).find('figure > a').attr('href')
                    //get title character
                    // lặp ra từng character rồi push vào mảng 
                    $(this).find('section > div > h3').each(function () {
                        titles.push($(this).text())
                    })

                    // get character details
                    $(this).find('section > div > div').each(function () {
                        details.push($(this).text())
                    })

                    if (image) {
                        // kết hợp key và value của  titles và details
                        for (let i = 0; i < titles.length; i++) {
                            objDetails[titles[i]] = details[i]
                        }

                        return res.status(200).json({
                            title: character,
                            image: image,
                            data_Detail: objDetails,
                            galleries: galleries
                        })
                    }

                })


            })
    } catch (error) {
        return res.status(500).json({ error })
    }
})

app.listen(process.env.PORT || 8000, () => {
    console.log('SERVER IS RUNNING')
})