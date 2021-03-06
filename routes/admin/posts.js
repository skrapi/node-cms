const express       = require('express')
const fs            = require('fs')
const moment        = require('moment') //date library - Could be removed?
const path          = require('path') //needed?
// Models
const Post          = require('../../models/Post')
// const vars
const router        = express.Router()
// Helpers
const uploadHelper  = require('../../helpers/uploadHelper') 

router.all('/*', (req, res, next) => {
    req.app.locals.layout = 'admin'
    next()
})

// Get
router.get('/', (req, res) => {
    Post.find({}).lean().then(posts => {
        res.render('admin/posts', { posts: posts })
    })
})
router.get('/create', (req, res) => {
    res.render('admin/posts/create')
})
router.get('/edit/:id', (req, res) => {
    Post.findById({_id: req.params.id}).lean().then(post => {
        res.render('admin/posts/edit', { post: post  })
    })
})

// Create
router.post('/create', (req, res) => {
    let errors      = []
    let fileName    = '';
    var allowComments

    if(!req.body.title) {
        errors.push({ message: 'Please enter a valid title' })
    }

    if (!req.files.file) {
        errors.push({ message: 'Please upload an image' })
    }

    if (!req.body.body) {
        errors.push({ message: 'Please enter a valid body' })
    }

    if(errors.length > 0) {
        res.render('admin/posts/create', { error: errors, post: req.body })
        return;
    }

    if (!uploadHelper.isEmpty(req.files)) {
        let file = req.files.file
        fileName = Date.now() + `-${file.name}`
        
        file.mv(`./public/uploads/${fileName}`, (err) => {
            if(err) throw err
        }) 
    }

    req.body.allowComments ? allowComments = true : allowComments = false
    
    const newPost = new Post({
        title: req.body.title,
        file: fileName,
        body: req.body.body,
        status: req.body.status,
        allowComments: allowComments,
        dateCreated: Date.now(),
        dateModified: Date.now()
    })
    
    newPost.save().then(savedPost => {
        req.flash('successMessage', `Post successfully created: "${savedPost.title}"`)
        res.status(200).redirect('/admin/posts')
    }).catch(err => {
        res.render('admin/posts.create', { error: err.errors })
        return;
    })
})
    
// Update
router.put('/edit/:id', (req, res) => {
    let errors      = []
    let fileName    = '';
    var allowComments
    
    Post.findById({ _id: req.params.id }).then(post => {
        if (!req.body.title) {
            errors.push({ message: 'Please enter a valid title' })
        }
    
        if (!req.body.file && !post.file) {
            errors.push({ message: 'Please upload an image' })
        }
    
        if (!req.body.body) {
            errors.push({ message: 'Please enter a valid body' })
        }
    
        if (errors.length > 0) {
            res.render('admin/posts/edit', { errors: errors, post: req.body })
            return;
        }

        req.body.allowComments ? allowComments = true : allowComments = false

        post.title          = req.body.title
        post.body           = req.body.body
        post.status         = req.body.status
        post.allowComments  = allowComments
        post.dateModified   = Date.now()

        if (!uploadHelper.isEmpty(req.files)) {
            let file = req.files.file
            fileName = Date.now() + `-${file.name}`
            post.file = fileName
            // fs.unlink(uploadHelper.uploadsDir + post.file, () => {
                file.mv(`./public/uploads/${fileName}`, (err) => {
                    if (err) throw err
                })
            // })
        }

        post.save().then(updatedPost => {
            req.flash('successMessage', `Post successfully updated: "${updatedPost.title}"`)
            res.status(200).redirect('/admin/posts')
        }).catch(err => {
            console.log(`Could not save post\n${err}`)
        })
    })
})

// Remove
router.delete('/delete/:id', (req, res) => {
    Post.findOne({_id: req.params.id}).then(post => {
        fs.unlink(uploadHelper.uploadsDir + post.file, () => {
            Post.deleteOne({ _id: req.params.id }).then(() => {
                req.flash('warningMessage', `Post successfully deleted!`)
                res.redirect('/admin/posts')
            }).catch(err => {
                console.log(`Could not delete post\n${err}`)
            })
        })
    })
})

module.exports = router
