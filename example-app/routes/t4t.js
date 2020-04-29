// table for tables
const express = require('express')
const Model = require('../../common-app/database')
const knex = Model.knex()

const csvParse = require('csv-parse')
// const { authUser } = require('../middlewares/auth')
const t4tCfg = {
  'books': { // table alias
    name: 'books', // table name
    id: 'id', // primary key name (if any)
    cols: {
      id: {

      },
      name: {
        key: true
      },
      categoryId: {
        // related
      },
      rating: {

      },
      yearPublished: {

      },
      created_at: {

      }
    }
    // {id: 1, name: 'book1', categoryId: 1, rating: 5, yearPublished: '2004', created_at: mkDt() },
  }
}

const table = t4tCfg['books']

function formUniqueKey(table, args) {
  const where = {}
  for (let col in table.cols) {
    if (table.cols[col].key) {
      if (args[col]) where[col] = args[col]
      else return null
    }
  }
  return (Object.keys(where).length) ? where : null
}

module.exports = express.Router()
  .get('/t4t/:table', asyncWrapper(async (req, res) => {
    res.json() // return the table info...
  }))
  .get('/t4t/:table/find', asyncWrapper(async (req, res) => {
    const { page = 1, limit = 2 } = req.query
    const rv = { results: [], total: 0 }
    const query = knex(table.name)
    let total = await query.clone().count()
    rv.total = Object.values(total[0])[0]
    // tbd where, sort
    rv.results = await query.clone().limit(limit).offset((page > 0 ? page - 1 : 0) * limit)
    res.json(rv)
  }))
  .get('/t4t/:table/find-one/:id?', asyncWrapper(async (req, res) => {
    const where = req.params.id ? { id: req.params.id } : formUniqueKey(table, req.query)
    if (!where) return res.status(400).json() // bad request
    const rv = await knex(table.name).where(where).first()
    return res.json(rv)
  }))
  .patch('/t4t/:table/update/:id?', asyncWrapper(async (req, res) => {
    const where = req.params.id ? { id: req.params.id } : formUniqueKey(table, req.query)
    if (!where) return res.status(400).json() // bad request
    const rv = await knex(table.name).update({ ...req.body }).where(where)
    res.json(rv)
  }))
  .post('/t4t/:table/create', asyncWrapper(async (req, res) => {
    const rv = await knex(table.name)
      .returning('id')
      .insert(req.body)
    res.json(rv)
  }))
  .delete('/t4t/:table/delete/:id', asyncWrapper(async (req, res) => {
    const where = req.params.id ? { id: req.params.id } : formUniqueKey(table, req.query)
    if (!where) return res.status(400).json() // bad request
    await knex(table.name).where(where).delete()
    res.json()
  }))
  .delete('/t4t/:table/delete-many', asyncWrapper(async (req, res) => {
    const ids = JSON.parse(req.query.ids) // [1,2,3]
    await knex(table.name).whereIn(id, ids).delete()
    res.json()
  }))

  .post('/t4t/:table/upload', upload.single('file'), asyncWrapper(async (req, res) => {
    const csv = req.file.buffer.toString('utf-8')
    const output = []
    let errors = []
    let currLine = 0
    csvParse(csv)
      .on('error', function(e) {
        // e.message
      })
      .on('readable', function () {
        let record
        while (record = this.read()) {
          currLine++
          if (currLine == 1) continue // ignore first line
          if (record.length === 2) { // ok
            if (record.join('')) {
              // if (permissionOk) {
              // } else {
              // }
            } else {
              errors.push({ currLine, data: record.join(','), msg: 'Empty Row' })
            }
          } else {
            errors.push({ currLine, data: record.join(','), msg: 'Incorrenct Column Count' })
          }
        }
      })
      .on('end', function () {
        let line = 0
        for (let row of output) {
          line++
          try {
            // TBD insert to table
          } catch (e) {
            errors.push({ line, data: row.join(','), msg: 'Caught exception: ' + e.toString() })
          }
        }
      })
  }))
