import { 
    Avatar, 
    Box, 
    Button, 
    Container, 
    FormLabel, 
    Heading, 
    Input, 
    VStack 
} from '@chakra-ui/react';
import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { register } from '../../redux/actions/user';

export const fileUploadCss =
{
    cursor: "pointer",
    marginLeft: "-5%",
    width: "110%",
    border: "none",
    height: "100%",
    color: "#ECC94B",
    backgroundColor: "white"
}

const fileUploadStyle = {
    "&::file-selector-button": fileUploadCss
}

const Register = () => {
    const [email, setEmail] = useState("");
    const [name, setName] = useState("");
    const [password, setPassword] = useState("");
    const [number,setNumber] = useState("");
    const [imagePrev, setImagePrev] = useState("");
    const [image, setImage] = useState("");

    const dispatch = useDispatch();

    const changeImageHandler = (e) => {
        const file = e.target.files[0];

        const reader = new FileReader();

        reader.readAsDataURL(file);

        reader.onloadend = () => {
            setImagePrev(reader.result);
            setImage(file);
        }
    };

    const submitHandler = e => {
        e.preventDefault();
        const myForm = new FormData();

        myForm.append('name', name);
        myForm.append('email', email);
        myForm.append('password', password);
        myForm.append('number',number);
        myForm.append('file', image);
        
        dispatch(register(myForm));
    };

    return (
        <Container h={'100vh'}>
            <VStack h={'full'} justifyContent="center" spacing={'10'}>
                <Heading textTransform={'uppercase'} children={'Registration'} />

                <form onSubmit={submitHandler} style={{ width: '100%' }}>
                    <Box my="3" display={'flex'} justifyContent="center">
                        <Avatar src={imagePrev} size={'xl'} />
                    </Box>
                    <Box my={'3'}>
                        <FormLabel htmlFor="name" children="Name" />
                        <Input
                            required
                            id="name"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            placeholder="abc"
                            type={"text"}
                            focusBorderColor="red.500"
                        />
                    </Box>

                    <Box my={'3'}>
                        <FormLabel htmlFor="email" children="Email Address" />
                        <Input
                            required
                            id="email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            placeholder="abc@gamil.com"
                            type={"email"}
                            focusBorderColor="red.500"
                        />
                    </Box>

                    <Box my={'3'}>
                        <FormLabel htmlFor="password" children="password" />
                        <Input
                            required
                            id="password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            placeholder="Enter Your Password"
                            type={"password"}
                            focusBorderColor="red.500"
                        />
                    </Box>

                    <Box my={'3'}>
                        <FormLabel htmlFor="number" children="Mobile Number" />
                        <Input
                            required
                            id="number"
                            value={number}
                            onChange={e => setNumber(e.target.value)}
                            placeholder="Enter Your Mobile Number"
                            type={"number"}
                            focusBorderColor="red.500"
                        />
                    </Box>

                    <Box >
                        <FormLabel htmlFor="chooseAvatar" children="Choose Avatar" />
                        <Input
                            accept="imge/*"
                            required
                            id="chooseAvatar"
                            type={"file"}
                            focusBorderColor="red.500"
                            css={fileUploadStyle}
                            onChange={changeImageHandler}

                        />
                    </Box>

                    <Button my="1" colorScheme={"red"} type="submit">
                        Sign Up
                    </Button>

                    <Box >
                        Already Signed Up?{' '}
                        <Link to="/login">
                            <Button colorScheme={'red'} variant="link">
                                Login
                            </Button>{" "}
                            here
                        </Link>
                    </Box>
                </form>
            </VStack>
        </Container>)
};

export default Register