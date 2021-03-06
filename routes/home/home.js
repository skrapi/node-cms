const express   = require('express')
// Models
const Post = require('../../models/Post')
// const vars
const router = express.Router()

router.all('/*', (req, res, next) => {
    req.app.locals.layout = 'home'
    next()
})

router.get('/', (req, res) => {
    Post.find({}).lean().then(posts => {
        res.render('home/index', { posts: posts })
    })
})

router.get('/post/:id', (req, res) => {
    Post.findById({ _id: req.params.id }).lean().then(post => {
        res.render('home/post', { post: post })
    })
})

router.get('/about', (req, res) => {
    res.render('home/about')
})

router.get('/login', (req, res) => {
    res.render('home/login')
})

router.get('/register', (req, res) => {
    res.render('home/register')
})

module.exports = router;