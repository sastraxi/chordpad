import { ViewOffIcon } from "@chakra-ui/icons"
import { Button, Card, CardBody, CardHeader, Divider, HStack, IconButton, Kbd, Spacer, Table, TableContainer, Tbody, Td, Text, Th, Thead, Tr, VStack } from "@chakra-ui/react"

const ToolWindows = () => {
  return (
    <VStack p={6} width="460px">

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
                colorScheme='blue'
                aria-label='Show / hide'
                icon={<ViewOffIcon />}
              />
            </HStack>
            <TableContainer w="100%">
              <Table size="xs" fontSize="14px">
                <Thead>
                  <Tr>
                    <Th color="white">Song name</Th>
                    <Th color="white" isNumeric>Saved at</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  <Tr>
                    <Td>My song</Td>
                    <Td isNumeric>just now</Td>
                  </Tr>
                  <Tr>
                    <Td>abc</Td>
                    <Td isNumeric>yesterday</Td>
                  </Tr>
                  <Tr>
                    <Td>def</Td>
                    <Td isNumeric>2 weeks ago</Td>
                  </Tr>
                  <Tr>
                    <Td>ghi</Td>
                    <Td isNumeric>May 21, 2023</Td>
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
