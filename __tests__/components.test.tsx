import { render, screen } from '@testing-library/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

describe('shadcn/ui Components', () => {
  describe('Button', () => {
    it('renders a button with text', () => {
      render(<Button>Click me</Button>)
      const button = screen.getByRole('button', { name: /click me/i })
      expect(button).toBeInTheDocument()
    })

    it('renders a button with variant', () => {
      render(<Button variant="destructive">Delete</Button>)
      const button = screen.getByRole('button', { name: /delete/i })
      expect(button).toBeInTheDocument()
    })
  })

  describe('Card', () => {
    it('renders a card with content', () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>Test Card</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Card content</p>
          </CardContent>
        </Card>
      )
      expect(screen.getByText('Test Card')).toBeInTheDocument()
      expect(screen.getByText('Card content')).toBeInTheDocument()
    })
  })

  describe('Table', () => {
    it('renders a table with data', () => {
      render(
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Symbol</TableHead>
              <TableHead>Price</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell>AAPL</TableCell>
              <TableCell>$150.00</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      )
      expect(screen.getByText('Symbol')).toBeInTheDocument()
      expect(screen.getByText('AAPL')).toBeInTheDocument()
      expect(screen.getByText('$150.00')).toBeInTheDocument()
    })
  })
})

