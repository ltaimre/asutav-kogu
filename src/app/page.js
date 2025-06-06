'use client'

import Header from '../components/Header'
import { Box, Text } from '@chakra-ui/react'

export default function HomePage() {
  return (
    <>
      <Header />
      <Box p={8}>
        <Text>Tere tulemast!</Text>
      </Box>
    </>
  )
}
