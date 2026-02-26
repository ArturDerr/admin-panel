import { useEffect, useMemo, useState } from "react";
import {
  Avatar,
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
  Spinner,
  Text,
  useDisclosure,
  useToast,
  VStack,
} from "@chakra-ui/react";
import type { User, UserDetails } from "../types";
import {
  createUser,
  deleteUser,
  fetchUserDetails,
  fetchUsers,
  toggleUserBan,
} from "../api/dashboard";
import SimpleSectionTable from "../components/SimpleSectionTable";

type UserRow = User & { id: string };

type CreateUserForm = {
  phone: string;
  fullname: string;
};

function formatDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleString("ru-RU");
}

function formatMoney(value: number): string {
  return `${value.toLocaleString("ru-RU")} ₸`;
}

export default function UsersPage() {
  const toast = useToast();

  const {
    isOpen: isDetailsOpen,
    onOpen: openDetailsModal,
    onClose: closeDetailsModal,
  } = useDisclosure();

  const {
    isOpen: isCreateOpen,
    onOpen: openCreateModal,
    onClose: closeCreateModal,
  } = useDisclosure();

  const [items, setItems] = useState<UserRow[]>([]);
  const [loadingList, setLoadingList] = useState(true);

  const [selectedUserPhone, setSelectedUserPhone] = useState<string | null>(
    null,
  );
  const [details, setDetails] = useState<UserDetails | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  const [createForm, setCreateForm] = useState<CreateUserForm>({
    phone: "",
    fullname: "",
  });
  const [creating, setCreating] = useState(false);

  const [actionLoadingPhone, setActionLoadingPhone] = useState<string | null>(
    null,
  );

  useEffect(() => {
    let mounted = true;

    async function loadUsers() {
      try {
        setLoadingList(true);
        const data = await fetchUsers();
        if (!mounted) return;

        const mapped: UserRow[] = data.items.map((user) => ({
          ...user,
          id: user.phone,
        }));

        setItems(mapped);
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Не удалось загрузить пользователей";

        toast({
          title: "Ошибка",
          description: message,
          status: "error",
          duration: 2500,
          isClosable: true,
        });
      } finally {
        if (mounted) setLoadingList(false);
      }
    }

    loadUsers();

    return () => {
      mounted = false;
    };
  }, [toast]);

  async function openDetails(user: UserRow) {
    setSelectedUserPhone(user.phone);
    setDetails(null);
    openDetailsModal();

    try {
      setLoadingDetails(true);
      const response = await fetchUserDetails(user.phone);
      setDetails(response);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Не удалось загрузить детали пользователя";

      toast({
        title: "Ошибка",
        description: message,
        status: "error",
        duration: 2500,
        isClosable: true,
      });
    } finally {
      setLoadingDetails(false);
    }
  }

  function resetCreateForm() {
    setCreateForm({
      phone: "",
      fullname: "",
    });
  }

  async function handleCreateUser() {
    const phone = createForm.phone.trim();
    const fullname = createForm.fullname.trim();

    if (!phone || !fullname) {
      toast({
        title: "Заполните поля",
        description: "Телефон и имя обязательны",
        status: "warning",
        duration: 2200,
        isClosable: true,
      });
      return;
    }

    try {
      setCreating(true);

      await createUser({
        phone,
        fullname,
        createdAt: new Date().toISOString(),
        isOnline: false,
        address: "Не указан",
        avatarUrl: "https://i.pravatar.cc/150?img=1",
        rating: 0,
        rentalSpentTotal: 0,
        rentalIncomeTotal: 0,
        isBanned: false,
      });

      setItems((prev) => [{ id: phone, phone, fullname }, ...prev]);

      toast({
        title: "Пользователь создан",
        status: "success",
        duration: 2200,
        isClosable: true,
      });

      closeCreateModal();
      resetCreateForm();
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Не удалось создать пользователя";

      toast({
        title: "Ошибка",
        description: message,
        status: "error",
        duration: 2600,
        isClosable: true,
      });
    } finally {
      setCreating(false);
    }
  }

  async function handleToggleBan(user: UserRow) {
    try {
      setActionLoadingPhone(user.phone);

      const updatedDetails = await toggleUserBan(user.phone);

      if (details?.phone === user.phone) {
        setDetails(updatedDetails);
      }

      toast({
        title: updatedDetails.isBanned ? "Пользователь забанен" : "Бан снят",
        status: updatedDetails.isBanned ? "warning" : "success",
        duration: 2000,
        isClosable: true,
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Не удалось изменить бан";

      toast({
        title: "Ошибка",
        description: message,
        status: "error",
        duration: 2600,
        isClosable: true,
      });
    } finally {
      setActionLoadingPhone(null);
    }
  }

  async function handleDeleteUser(user: UserRow) {
    const ok = window.confirm(
      `Удалить пользователя ${user.fullname} (${user.phone})?`,
    );
    if (!ok) return;

    try {
      setActionLoadingPhone(user.phone);
      await deleteUser(user.phone);

      setItems((prev) => prev.filter((item) => item.phone !== user.phone));

      if (selectedUserPhone === user.phone) {
        setSelectedUserPhone(null);
        setDetails(null);
        closeDetailsModal();
      }

      toast({
        title: "Пользователь удалён",
        status: "success",
        duration: 2200,
        isClosable: true,
      });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Не удалось удалить пользователя";

      toast({
        title: "Ошибка",
        description: message,
        status: "error",
        duration: 2600,
        isClosable: true,
      });
    } finally {
      setActionLoadingPhone(null);
    }
  }

  const columns = useMemo(
    () => [
      { key: "phone", title: "phone" },
      { key: "fullname", title: "fullname" },
    ],
    [],
  );

  return (
    <Box>
      <HStack justify="space-between" mb={4}>
        <Text fontSize="xl" fontWeight="700">
          Пользователи
        </Text>

        <Button rounded="none" colorScheme="blue" onClick={openCreateModal}>
          Создать пользователя
        </Button>
      </HStack>

      {loadingList ? (
        <HStack justify="center" py={16}>
          <Spinner thickness="3px" speed="0.7s" color="#2f80ed" />
          <Text color="#98a1ac">Загрузка пользователей...</Text>
        </HStack>
      ) : (
        <SimpleSectionTable<UserRow>
          title="Пользователи"
          items={items}
          columns={columns}
          onOpenDetails={openDetails}
          emptyText="Пользователи не найдены"
          rowActions={[
            {
              key: "ban",
              label: "Бан / Разбан",
              colorScheme: "orange",
              variant: "outline",
              onClick: handleToggleBan,
              isDisabled: (item) => actionLoadingPhone === item.phone,
            },
            {
              key: "delete",
              label: "Удалить",
              colorScheme: "red",
              variant: "outline",
              onClick: handleDeleteUser,
              isDisabled: (item) => actionLoadingPhone === item.phone,
            },
          ]}
        />
      )}

      <Modal isOpen={isCreateOpen} onClose={closeCreateModal} isCentered>
        <ModalOverlay bg="blackAlpha.300" />
        <ModalContent
          bg="#ffffff"
          border="1px solid"
          borderColor="#d9dde3"
          color="#2b2f36"
          borderRadius="none"
        >
          <ModalHeader>Создать пользователя</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <VStack spacing={4} align="stretch">
              <FormControl isRequired>
                <FormLabel color="#98a1ac">Телефон</FormLabel>
                <Input
                  value={createForm.phone}
                  onChange={(e) =>
                    setCreateForm((prev) => ({
                      ...prev,
                      phone: e.target.value,
                    }))
                  }
                  placeholder="+7 700 000 00 00"
                  bg="#ffffff"
                  borderColor="#d9dde3"
                  _focus={{
                    borderColor: "#7ed957",
                    boxShadow: "0 0 0 1px #7ed957",
                  }}
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel color="#98a1ac">Имя</FormLabel>
                <Input
                  value={createForm.fullname}
                  onChange={(e) =>
                    setCreateForm((prev) => ({
                      ...prev,
                      fullname: e.target.value,
                    }))
                  }
                  placeholder="ФИО"
                  bg="#ffffff"
                  borderColor="#d9dde3"
                  _focus={{
                    borderColor: "#7ed957",
                    boxShadow: "0 0 0 1px #7ed957",
                  }}
                />
              </FormControl>

              <HStack justify="flex-end">
                <Button
                  variant="outline"
                  colorScheme="gray"
                  onClick={closeCreateModal}
                >
                  Отмена
                </Button>
                <Button
                  colorScheme="blue"
                  onClick={handleCreateUser}
                  isLoading={creating}
                >
                  Создать
                </Button>
              </HStack>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>

      <Modal
        isOpen={isDetailsOpen}
        onClose={closeDetailsModal}
        size="xl"
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
          <ModalHeader>
            Пользователь {selectedUserPhone ? `— ${selectedUserPhone}` : ""}
          </ModalHeader>
          <ModalCloseButton />

          <ModalBody pb={6}>
            {loadingDetails ? (
              <HStack justify="center" py={10}>
                <Spinner thickness="3px" speed="0.7s" color="#7ed957" />
                <Text color="#98a1ac">Загрузка деталей...</Text>
              </HStack>
            ) : !details ? (
              <Text color="#98a1ac">Данные недоступны</Text>
            ) : (
              <VStack align="stretch" spacing={4}>
                <HStack spacing={4}>
                  <Avatar
                    size="lg"
                    name={details.fullname}
                    src={details.avatarUrl}
                  />
                  <VStack align="start" spacing={0.5}>
                    <Text fontSize="lg" fontWeight="700">
                      {details.fullname}
                    </Text>
                    <Text color="#98a1ac">{details.phone}</Text>
                    <HStack>
                      <Badge colorScheme={details.isOnline ? "green" : "gray"}>
                        {details.isOnline ? "Онлайн" : "Оффлайн"}
                      </Badge>
                      <Badge colorScheme={details.isBanned ? "red" : "green"}>
                        {details.isBanned ? "В бане" : "Активен"}
                      </Badge>
                    </HStack>
                  </VStack>
                </HStack>

                <Box
                  border="1px solid"
                  borderColor="#d9dde3"
                  borderRadius="none"
                  p={4}
                >
                  <VStack align="stretch" spacing={2}>
                    <Text>
                      <Text as="span" color="#98a1ac">
                        Когда создан:
                      </Text>{" "}
                      {formatDate(details.createdAt)}
                    </Text>
                    <Text>
                      <Text as="span" color="#98a1ac">
                        Адрес:
                      </Text>{" "}
                      {details.address}
                    </Text>
                    <Text>
                      <Text as="span" color="#98a1ac">
                        Рейтинг:
                      </Text>{" "}
                      {details.rating}
                    </Text>
                    <Text>
                      <Text as="span" color="#98a1ac">
                        Сумма за аренду:
                      </Text>{" "}
                      {formatMoney(details.rentalSpentTotal)}
                    </Text>
                    <Text>
                      <Text as="span" color="#98a1ac">
                        Сумма за сдачу:
                      </Text>{" "}
                      {formatMoney(details.rentalIncomeTotal)}
                    </Text>
                  </VStack>
                </Box>

                <HStack justify="flex-end" pt={1}>
                  <Button
                    onClick={closeDetailsModal}
                    variant="outline"
                    colorScheme="blue"
                  >
                    Закрыть
                  </Button>
                </HStack>
              </VStack>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
}
