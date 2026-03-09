const Project = require('../models/Project')

async function listProjects(req, res) {
  try {
    const projects = await Project.find({ user: req.user._id })
      .sort({ updated_at: -1 })
      .select('title description blocks.length total_duration status engine format created_at updated_at')

    // Map to include block count
    const result = projects.map(p => ({
      id: p._id,
      title: p.title,
      description: p.description,
      blocks: p.blocks.length,
      total_duration: p.total_duration,
      status: p.status,
      engine: p.engine,
      format: p.format,
      created_at: p.created_at,
      updated_at: p.updated_at,
    }))

    res.json({ projects: result })
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch projects', detail: err.message })
  }
}

async function getProject(req, res) {
  try {
    const project = await Project.findOne({ _id: req.params.id, user: req.user._id })
    if (!project) return res.status(404).json({ message: 'Project not found' })
    res.json(project)
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch project', detail: err.message })
  }
}

async function createProject(req, res) {
  try {
    const { title, description, blocks, engine, format } = req.body

    const project = await Project.create({
      user: req.user._id,
      title: title || 'Untitled Project',
      description: description || '',
      blocks: blocks || [],
      engine: engine || 'cinematic',
      format: format || 'wav',
    })

    res.status(201).json(project)
  } catch (err) {
    res.status(500).json({ message: 'Failed to create project', detail: err.message })
  }
}

async function updateProject(req, res) {
  try {
    const project = await Project.findOne({ _id: req.params.id, user: req.user._id })
    if (!project) return res.status(404).json({ message: 'Project not found' })

    const { title, description, blocks, engine, format, status } = req.body
    if (title !== undefined) project.title = title
    if (description !== undefined) project.description = description
    if (blocks !== undefined) project.blocks = blocks
    if (engine) project.engine = engine
    if (format) project.format = format
    if (status) project.status = status

    await project.save()
    res.json(project)
  } catch (err) {
    res.status(500).json({ message: 'Failed to update project', detail: err.message })
  }
}

async function deleteProject(req, res) {
  try {
    const project = await Project.findOne({ _id: req.params.id, user: req.user._id })
    if (!project) return res.status(404).json({ message: 'Project not found' })
    await project.deleteOne()
    res.json({ message: 'Project deleted' })
  } catch (err) {
    res.status(500).json({ message: 'Delete failed', detail: err.message })
  }
}

module.exports = { listProjects, getProject, createProject, updateProject, deleteProject }
