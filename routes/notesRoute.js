const express = require('express');
const db = require('../data/dbConfig');

const router = express.Router();

const { authenticate } = require('./middlewares');

router.get('/get/all', authenticate, (req, res) => {
  db('notes')
    .then(notes => res.status(200).json(notes))
    .catch(err => res.status(500).json({ message: 'There was an error retrieving the notes' }));
});

router.get('/get/:id', authenticate, (req, res) => {
  db('notes')
    .where({ id: req.params.id })
    .first()
    .then(note =>
      note
      ? res.status(200).json(note)
      : res.status(404).json({ message: 'Could not find that note.' }))
    .catch(err => res.status(500).json({ message: 'There was an error accessing the note' }));
});

router.post('/create', authenticate, async (req, res) => {
  const { title, textBody } = req.body;
  const note = { title, textBody }
  if (title && textBody) {
    try {
      const id = await db('notes').insert(note);
      res.status(201).json(id[0]);
    } catch (err) {
      console.log(err) &&
      res.status(500).json({ message: 'The note could not be saved' });
    }
  } else {
    res.status(400).json({ message: 'Both a title and a body are required to add a note' });
  }
});

router.put('/edit/:id', authenticate, (req, res) => {
  db('notes')
    .where({ id: req.params.id })
    .update(req.body)
    .then(count =>
      count
        ? db('notes').where({ id: req.params.id }).first().then(note => res.status(200).json(note))
        : res.status(404).json({ message: 'Could not find note with that id' }))
    .catch(err => res.status(500).json({ message: 'An error occured while saving the edits' }));
});

router.delete('/delete/:id', authenticate, (req, res) => {
  db('notes')
    .where({ id: req.params.id })
    .del()
    .then(count =>
      count
        ? res.status(204).json({ message: 'Deleted!' })
        : res.status(404).json({ message: 'Could not find that note' }))
    .catch(err => res.status(500).json({ message: 'An error occured while deleting the note' }));
});

module.exports = router;
