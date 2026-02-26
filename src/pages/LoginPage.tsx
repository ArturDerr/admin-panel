import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import bgVideo from '/92b7a606e03403045d13c7681c248c3c.mp4'
import {
  Box,
  Button,
  Card,
  CardBody,
  FormControl,
  Heading,
  Icon,
  Input,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  Text,
  VStack,
  useToast,
} from "@chakra-ui/react";
import { Lock, Phone, Eye, EyeOff } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { login } from "../api/auth";

function normalizePhone(value: string): string {
  return value.replace(/[^\d+]/g, "");
}

export default function LoginPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const videoRef = useRef<HTMLVideoElement>(null);

  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [isPasswordShown, setIsPasswordShown] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const normalizedPhone = normalizePhone(phone);

    if (!normalizedPhone) {
      toast({
        title: "Введите телефон",
        status: "warning",
        duration: 2200,
        isClosable: true,
      });
      return;
    }

    if (!password) {
      toast({
        title: "Введите пароль",
        status: "warning",
        duration: 2200,
        isClosable: true,
      });
      return;
    }

    try {
      setIsLoading(true);

      await login({
        phone: normalizedPhone,
        password,
      });

      toast({
        title: "Успешный вход",
        status: "success",
        duration: 1800,
        isClosable: true,
      });

      navigate("/dashboard/products", { replace: true });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Ошибка авторизации";

      toast({
        title: "Не удалось войти",
        description: message,
        status: "error",
        duration: 2600,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch(error => {
        console.log("Автовоспроизведение не удалось:", error);
      });
    }
  }, []);

  return (
    <Box
      minH="100vh"
      w="100%"
      bg="#eef1f4"
      display="flex"
      alignItems="center"
      justifyContent="center"
      px={4}
      py={8}
    >
      <video
          ref={videoRef}
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            minWidth: "100%",
            minHeight: "100%",
            width: "auto",
            height: "auto",
            objectFit: "cover",
          }}
        >
          <source src={bgVideo} type="video/mp4" />
          Ваш браузер не поддерживает видео.
        </video>
      <Card
        w="full"
        h="full"
        maxW="440px"
        bg="#ffffff"
        rounded="none"
        border="1px solid #d9dde3"
        boxShadow="sm"
      >
        <CardBody p={{ base: 6, md: 8 }}>
          <Box as="form" onSubmit={onSubmit}>
            <VStack spacing={5}>
              <Box textAlign="center" w="full">
                <Heading size="lg" color="#2b2f36" mb={2}>
                  Вход
                </Heading>
              </Box>
              <FormControl isRequired>
                <InputGroup>
                  <InputLeftElement pointerEvents="none">
                    <Phone size={14} color="#8b95a5" />
                  </InputLeftElement>
                  <Input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Введите номер телефона"
                    bg="#ffffff"
                    rounded="none"
                    borderColor="#d9dde3"
                    color="#2b2f36"
                    _placeholder={{ color: "#98a1ac" }}
                    _hover={{ borderColor: "#2f80ed" }}
                    _focusVisible={{
                      borderColor: "#2f80ed",
                      boxShadow: "none",
                    }}
                  />
                </InputGroup>
              </FormControl>
              <FormControl isRequired>
                <InputGroup>
                  <InputLeftElement pointerEvents="none">
                    <Lock size={14} color="#8b95a5" />
                  </InputLeftElement>
                  <Input
                    type={isPasswordShown ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Введите пароль"
                    bg="#ffffff"
                    rounded="none"
                    borderColor="#d9dde3"
                    color="#2b2f36"
                    _placeholder={{ color: "#98a1ac" }}
                    _hover={{ borderColor: "#2f80ed" }}
                    _focusVisible={{
                      borderColor: "#2f80ed",
                      boxShadow: "none",
                    }}
                  />

                  <InputRightElement>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsPasswordShown((prev) => !prev)}
                      color="gray.400"
                      _hover={{ bg: "transparent", color: "black" }}
                    >
                      {isPasswordShown ? (
                        <EyeOff size={16} />
                      ) : (
                        <Eye size={16} />
                      )}
                    </Button>
                  </InputRightElement>
                </InputGroup>
              </FormControl>

              <Button
                type="submit"
                w="full"
                bg="#2b2f36"
                color="white"
                rounded="none"
                _hover={{ bg: "#2f80ed" }}
                _active={{ bg: "#2f80ed" }}
                isLoading={isLoading}
              >
                Войти
              </Button>
              <Text
                fontSize="xs"
                color="#8b95a5"
                textTransform="uppercase"
                letterSpacing="0.16em"
              >
                или
              </Text>
              <Button
                type="button"
                w="full"
                variant="outline"
                borderColor="#d9dde3"
                color="#2b2f36"
                rounded="none"
                isDisabled
                _hover={{ bg: "transparent", borderColor: "#d9dde3" }}
                leftIcon={
                  <Icon viewBox="0 0 24 24" boxSize="18px" color="#2AABEE">
                    <path
                      fill="currentColor"
                      d="M21.944 4.649c.29-1.062-.386-1.48-1.19-1.19L2.575 10.3c-1.076.42-1.062 1.017-.186 1.286l4.63 1.444 1.77 5.468c.207.572.105.8.736.8.487 0 .7-.224.97-.487l2.254-2.192 4.69 3.46c.865.478 1.487.232 1.703-.8L21.944 4.65ZM8.96 12.94l8.613-5.43c.442-.268.848-.123.515.175l-7.38 6.67-.285 3.004-.784-2.514-2.68-.905Z"
                    />
                  </Icon>
                }
              >
                Вход через Telegram
              </Button>
            </VStack>
          </Box>
        </CardBody>
      </Card>
    </Box>
  );
}
