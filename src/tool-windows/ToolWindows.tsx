import { Button, Card, CardBody, CardHeader, Divider, HStack, Kbd, Tab, TabList, TabPanel, TabPanels, Table, TableContainer, Tabs, Tbody, Td, Text, Th, Thead, Tr, VStack } from "@chakra-ui/react"

const ToolWindows = () => {
  return (
    <VStack p={6}>

      <Card background="blue.800" color="white" minW="350px" boxShadow="xl">
        <CardHeader py={4}>
          <HStack gap={2}>
            <Button size="sm">Save</Button>
            <Button size="sm">Save as...</Button>
            <Button size="sm"></Button>
          </HStack>
        </CardHeader>
        <Divider />
        <CardBody>
          <Tabs size="sm" variant="solid-rounded" colorScheme='blue'>
            <TabList color="white">
              <Tab color="white">Help</Tab>
              <Tab color="white">Songs</Tab>
            </TabList>
            <TabPanels>
              <TabPanel>
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
              </TabPanel>
              <TabPanel>
                <TableContainer>
                  <Table size='sm'>
                    <Thead>
                      <Tr>
                        <Th color="white">To convert</Th>
                        <Th color="white">into</Th>
                        <Th color="white" isNumeric>multiply by</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      <Tr>
                        <Td>inches</Td>
                        <Td>millimetres (mm)</Td>
                        <Td isNumeric>25.4</Td>
                      </Tr>
                      <Tr>
                        <Td>feet</Td>
                        <Td>centimetres (cm)</Td>
                        <Td isNumeric>30.48</Td>
                      </Tr>
                      <Tr>
                        <Td>yards</Td>
                        <Td>metres (m)</Td>
                        <Td isNumeric>0.91444</Td>
                      </Tr>
                    </Tbody>
                  </Table>
                </TableContainer>
              </TabPanel>
            </TabPanels>
          </Tabs>
        </CardBody>
      </Card>

    </VStack >
  )
}

export default ToolWindows
