import { ViewOffIcon } from "@chakra-ui/icons"
import { Button, Card, CardBody, HStack, IconButton, Kbd, Link, Spacer, Table, TableContainer, Tbody, Td, Text, Th, Thead, Tr, VStack } from "@chakra-ui/react"
import { TOOL_WINDOW_WIDTH } from "../components/constants"

const ToolWindows = () => {
  return (
    <VStack p={6} width={TOOL_WINDOW_WIDTH} position="fixed" top={0} right={0}>

      <Card background="red.800" color="white" w="100%" boxShadow="xl">
        <CardBody>
          <HStack>
            <Kbd color="black">drag</Kbd>
            <Text fontSize="sm">to select / move / resize</Text>
          </HStack>
          <HStack>
            <Kbd color="black">ctrl</Kbd>
            <Text fontSize="sm">+</Text>
            <Kbd color="black">drag</Kbd>
            <Text fontSize="sm">to box select / clone / ripple edit</Text>
          </HStack>
        </CardBody>
      </Card>

      <Card background="blue.800" color="white" w="100%" boxShadow="xl">
        <CardBody py={4}>
          <VStack gap={4}>
            <HStack gap={2} w="100%">
              <Button size="xs">New song</Button>
              <Button size="xs">Save "My song"</Button>
              <Spacer />
              <IconButton
                size="xs"
                colorScheme='white'
                aria-label='Show / hide'
                icon={<ViewOffIcon />}
              />
            </HStack>
            <TableContainer w="100%">
              <Table size="sm">
                <Thead>
                  <Tr>
                    <Th px={0} w={0} />
                    <Th color="white">Song name</Th>
                    <Th color="white" isNumeric>Last modified</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  <Tr>
                    <Td px={0}><Button size="xs">x</Button></Td>
                    <Td><Link href="#">My song</Link></Td>
                    <Td isNumeric>just now</Td>
                  </Tr>
                  <Tr>
                    <Td px={0}><Button size="xs">x</Button></Td>
                    <Td><Link href="#">Silly Child</Link></Td>
                    <Td isNumeric>yesterday</Td>
                  </Tr>
                  <Tr>
                    <Td px={0}><Button size="xs">x</Button></Td>
                    <Td><Link href="#">The Reckoning</Link></Td>
                    <Td isNumeric>2 weeks ago</Td>
                  </Tr>
                  <Tr>
                    <Td px={0}><Button size="xs">x</Button></Td>
                    <Td><Link href="#">Release Me</Link></Td>
                    <Td isNumeric>May 21, 2013</Td>
                  </Tr>
                </Tbody>
              </Table>
            </TableContainer>
          </VStack>
        </CardBody>
      </Card>

    </VStack >
  )
}

export default ToolWindows
