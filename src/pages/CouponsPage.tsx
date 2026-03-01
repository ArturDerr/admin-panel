import { useEffect, useState } from "react";
import {
  Badge,
  Box,
  Button,
  FormControl,
  FormLabel,
  HStack,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Text,
  VStack,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import type { Coupon } from "../types";
import { createCoupon, fetchCoupons } from "../api/dashboard";
import SimpleSectionTable from "../components/SimpleSectionTable";

export default function CouponsPage() {
  const toast = useToast();
  const [items, setItems] = useState<Coupon[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const createModal = useDisclosure();
  const [newCoupon, setNewCoupon] = useState({
    code: "",
    discountPercent: "",
    isActive: true,
  });
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function loadCoupons() {
      try {
        setIsLoading(true);
        const response = await fetchCoupons();
        if (mounted) {
          setItems(response.items);
        }
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Ошибка загрузки купонов";
        toast({
          title: "Не удалось загрузить купоны",
          description: message,
          status: "error",
          duration: 2500,
          isClosable: true,
        });
      } finally {
        if (mounted) setIsLoading(false);
      }
    }

    loadCoupons();

    return () => {
      mounted = false;
    };
  }, [toast]);

  function handleChange<K extends keyof typeof newCoupon>(
    key: K,
    value: (typeof newCoupon)[K],
  ) {
    setNewCoupon((prev) => ({ ...prev, [key]: value }));
  }

  async function handleCreateCoupon() {
    const code = newCoupon.code.trim();
    const discountPercent = parseInt(newCoupon.discountPercent);

    if (!code || isNaN(discountPercent)) {
      toast({
        title: "Заполните поля",
        description: "Код и процент скидки обязательны",
        status: "warning",
        duration: 2200,
        isClosable: true,
      });
      return;
    }

    try {
      setIsCreating(true);
      const created = await createCoupon({
        code,
        discountPercent,
        isActive: newCoupon.isActive,
      });

      setItems((prev) => [created, ...prev]);

      toast({
        title: "Купон создан",
        status: "success",
        duration: 2200,
        isClosable: true,
      });

      createModal.onClose();
      setNewCoupon({ code: "", discountPercent: "", isActive: true });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Не удалось создать купон";
      toast({
        title: "Ошибка",
        description: message,
        status: "error",
        duration: 2600,
        isClosable: true,
      });
    } finally {
      setIsCreating(false);
    }
  }

  return (
    <Box>
      <HStack mb={4} justify="space-between">
        <Text fontSize="xl" fontWeight="700">
          Купоны
        </Text>
        <Button
          colorScheme="blue"
          rounded="none"
          onClick={createModal.onOpen}
        >
          Создать купон
        </Button>
      </HStack>

      <SimpleSectionTable<Coupon>
        title="Список купонов"
        items={items}
        columns={[
          { key: "id", title: "ID" },
          { key: "code", title: "code" },
          {
            key: "discountPercent",
            title: "discount",
            render: (item) => `${item.discountPercent}%`,
          },
          {
            key: "isActive",
            title: "status",
            render: (item) => (
              <Badge colorScheme={item.isActive ? "green" : "gray"}>
                {item.isActive ? "active" : "inactive"}
              </Badge>
            ),
          },
        ]}
        emptyText={isLoading ? "Загрузка..." : "Купоны не найдены"}
      />

      <Modal
        isOpen={createModal.isOpen}
        onClose={createModal.onClose}
        isCentered
      >
        <ModalOverlay bg="blackAlpha.300" />
        <ModalContent
          bg="#ffffff"
          border="1px solid"
          borderColor="#d9dde3"
          color="#2b2f36"
          borderRadius="none"
        >
          <ModalHeader>Создать купон</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <VStack spacing={4} align="stretch">
              <FormControl isRequired>
                <FormLabel color="#98a1ac">Код купона</FormLabel>
                <Input
                  value={newCoupon.code}
                  rounded="none"
                  onChange={(e) => handleChange("code", e.target.value)}
                  placeholder="Введите код купона"
                  bg="#ffffff"
                  borderColor="#d9dde3"
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel color="#98a1ac">Процент скидки</FormLabel>
                <Input
                  value={newCoupon.discountPercent}
                  onChange={(e) =>
                    handleChange("discountPercent", e.target.value)
                  }
                  placeholder="Введите процент скидки"
                  type="number"
                  rounded="none"
                  bg="#ffffff"
                  borderColor="#d9dde3"
                />
              </FormControl>

              <HStack justify="flex-end">
                <Button
                  variant="outline"
                  colorScheme="gray"
                  rounded="none"
                  onClick={createModal.onClose}
                >
                  Отмена
                </Button>
                <Button
                  colorScheme="blue"
                  rounded="none"
                  onClick={handleCreateCoupon}
                  isLoading={isCreating}
                >
                  Создать
                </Button>
              </HStack>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
}
