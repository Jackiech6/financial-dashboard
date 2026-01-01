'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

/**
 * Test page to verify shadcn/ui components are working
 * This page can be removed after Phase 1 verification
 */
export default function TestPage() {
  return (
    <div className="container mx-auto p-8 space-y-8">
      <h1 className="text-3xl font-bold">Phase 1 Setup Verification</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Button Component Test</CardTitle>
        </CardHeader>
        <CardContent className="space-x-4">
          <Button>Default Button</Button>
          <Button variant="destructive">Destructive</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="secondary">Secondary</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Table Component Test</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Symbol</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Change</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>AAPL</TableCell>
                <TableCell>$150.00</TableCell>
                <TableCell className="text-green-500">+2.5%</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>MSFT</TableCell>
                <TableCell>$380.00</TableCell>
                <TableCell className="text-red-500">-1.2%</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>✅ Phase 1 Complete</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            All shadcn/ui components are working correctly. You can proceed to Phase 2.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

