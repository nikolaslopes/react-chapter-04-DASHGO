import { createServer, Factory, Model, Response } from 'miragejs'
import { faker } from '@faker-js/faker'
import { IUser } from './types'

export function makeServer() {
  const server = createServer({
    models: {
      user: Model.extend<Partial<IUser>>({}),
    },

    factories: {
      user: Factory.extend({
        name(index: number) {
          return `Deep Fake ${index + 1}`
        },
        email() {
          return faker.internet.email().toLocaleLowerCase()
        },
        createdAt() {
          return faker.date.recent(10)
        },
      }),
    },

    seeds(server) {
      server.createList('user', 200)
    },

    routes() {
      this.namespace = 'api' // * Sets the namespace to use the routes
      this.timing = 750

      this.get('/users', function (schema, request) {
        const { page = 1, per_page = 10 } = request.queryParams

        const total = schema.all('user').length

        const pageStart = (Number(page) - 1) * Number(per_page)
        const pageEnd = pageStart + Number(per_page)

        const users = this.serialize(schema.all('user')).users.slice(
          pageStart,
          pageEnd
        )

        return new Response(200, { 'x-total-count': String(total) }, { users })
      })
      this.post('/users')

      this.namespace = '' // * Reset namespace to don't cause trouble with Next API routes
      this.passthrough() // * All API calls to '/api' address will be passed through Mirage, but if the call would not a mirage route, it will be passed on from your original route
    },
  })

  return server
}
