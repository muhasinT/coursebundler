import { Box, Heading, HStack, Stack, VStack } from '@chakra-ui/react'
import React from 'react'
import {TiSocialYoutubeCircular,TiSocialInstagramCircular} from 'react-icons/ti'
import {DiGithub } from 'react-icons/di'

const Footer = () => {
    return (
        <Box padding={'4'} bg='blackAlpha.900' minH={'10vh'}>
            <Stack direction={['column', 'row']}>
                <VStack alignItems={['center', 'flex-start']} width='full'>
                    <Heading children='All Copy are Rights Reserved' color={'white'} />
                    <Heading
                        fontFamily={'body'}
                        size='sm'
                        children='@6 Pack Programmer'
                        color={'red.400'} />
                </VStack>
                <HStack spacing={['2','10']} justifyContent='center'
                color={'white'} fontSize='50'
                >
                <a href="https://youturbe.com/6packprogrammer" target={'blank'} rel="noreferrer" >
                    <TiSocialYoutubeCircular/>
                </a>
                <a href="https://instagram.com/muhasin.t" target={'blank'} rel="noreferrer">
                    <TiSocialInstagramCircular/>
                </a>
                <a href="https://github.com/muhasint" target={'blank'} rel="noreferrer">
                    <DiGithub/>
                </a>
                </HStack>
            </Stack>
        </Box>
    )
}

export default Footer