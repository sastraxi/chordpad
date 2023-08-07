import { Button, ButtonProps, Popover, PopoverArrow, PopoverBody, PopoverCloseButton, PopoverContent, PopoverHeader, PopoverTrigger, useDisclosure } from "@chakra-ui/react"
import React, { useCallback } from "react"

type PopoverInputProps<T,> = {
  value: T
  onChange: (t: T) => void

  header?: React.ReactNode
  closeOnChange?: boolean

  editorComponent: React.FC<{
    value: T
    onChange: (t: T) => void
  }>
  displayComponent: React.FC<{
    value: T
  }>

  buttonProps?: Partial<ButtonProps>
}

const PopoverInput = <T,>({
  value,
  onChange,
  header,
  closeOnChange = false,
  editorComponent,
  displayComponent,
  buttonProps = {},
}: PopoverInputProps<T>) => {
  const { isOpen, onToggle, onClose } = useDisclosure()

  const onChangeProxy = useCallback((value: T) => {
    onChange(value)
    if (closeOnChange) {
      onClose()
    }
  }, [onClose, onChange, closeOnChange])

  return (
    <Popover
      isOpen={isOpen}
      onClose={onClose}
    >
      <PopoverTrigger>
        <Button {...buttonProps} onClick={onToggle}>
          {React.createElement(displayComponent, { value })}
        </Button>
      </PopoverTrigger>
      <PopoverContent boxShadow="lg">
        <PopoverArrow />
        {header && <PopoverCloseButton />}
        {header && <PopoverHeader>{header}</PopoverHeader>}
        <PopoverBody>
          {React.createElement(editorComponent, { value, onChange: onChangeProxy })}
        </PopoverBody>
      </PopoverContent>
    </Popover>
  )
}

export default PopoverInput
