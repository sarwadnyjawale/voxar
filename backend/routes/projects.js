const express = require('express')
const router = express.Router()
const { authMiddleware } = require('../middleware/auth')
const { listProjects, getProject, createProject, updateProject, deleteProject } = require('../controllers/projectController')

router.get('/', authMiddleware, listProjects)
router.get('/:id', authMiddleware, getProject)
router.post('/', authMiddleware, createProject)
router.patch('/:id', authMiddleware, updateProject)
router.delete('/:id', authMiddleware, deleteProject)

module.exports = router
