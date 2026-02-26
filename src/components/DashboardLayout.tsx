import { useState } from "react";
import type { ComponentType, SVGProps } from "react";
import {
  Box,
  Button,
  Divider,
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerOverlay,
  Flex,
  HStack,
  IconButton,
  Text,
  VStack,
  useDisclosure,
} from "@chakra-ui/react";
import {
  Ban,
  FileWarning,
  Gift,
  ListChecks,
  LogOut,
  Menu,
  MessageSquare,
  Package,
  ShieldCheck,
  Star,
  Users,
  X,
} from "lucide-react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import type { MenuKey } from "../types";
import { logout } from "../api/auth";

type NavItem = {
  key: MenuKey;
  label: string;
  path: string;
  icon: ComponentType<SVGProps<SVGSVGElement> & { size?: string | number }>;
};

const navItems: NavItem[] = [
  {
    key: "products",
    label: "Товары",
    path: "/dashboard/products",
    icon: Package,
  },
  {
    key: "users",
    label: "Пользователи",
    path: "/dashboard/users",
    icon: Users,
  },
  {
    key: "orders",
    label: "Заказы",
    path: "/dashboard/orders",
    icon: ListChecks,
  },
  { key: "coupons", label: "Купоны", path: "/dashboard/coupons", icon: Gift },
  {
    key: "chats",
    label: "Чаты",
    path: "/dashboard/chats",
    icon: MessageSquare,
  },
  { key: "reviews", label: "Отзывы", path: "/dashboard/reviews", icon: Star },
  {
    key: "complaints",
    label: "Жалобы",
    path: "/dashboard/complaints",
    icon: FileWarning,
  },
  { key: "bans", label: "Баны", path: "/dashboard/bans", icon: Ban },
  {
    key: "product_moderation",
    label: "Модерация товаров",
    path: "/dashboard/product-moderation",
    icon: ShieldCheck,
  },
];

type SidebarContentProps = {
  collapsed: boolean;
  onNavigate?: () => void;
  onLogout: () => void;
};

function SidebarContent({
  collapsed,
  onNavigate,
  onLogout,
}: SidebarContentProps) {
  const location = useLocation();

  return (
    <Flex
      direction="column"
      h="100%"
      bg="#2f3542"
      borderRight="1px solid"
      borderColor="#3b4353"
      py={5}
      px={collapsed ? 2 : 3}
      gap={3}
    >
      <HStack px={2} py={1} justify={collapsed ? "center" : "space-between"}>
        {!collapsed && (
          <Text
            textColor="white"
            fontSize="lg"
            fontWeight="700"
            letterSpacing="0.5px"
          >
            Admin Panel
          </Text>
        )}
      </HStack>

      <Divider borderColor="#3b4353" />

      <VStack spacing={1} align="stretch" flex={1} overflowY="auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = location.pathname === item.path;
          return (
            <NavLink
              key={item.key}
              to={item.path}
              onClick={onNavigate}
              style={{ textDecoration: "none" }}
            >
              <HStack
                px={3}
                py={2.5}
                borderRadius="none"
                bg={active ? "#3b4353" : "transparent"}
                color={active ? "#f5f7fa" : "#c2c8d2"}
                _hover={{ bg: "#FFFFFF", color: "#1f232b" }}
                transition="all .2s"
                spacing={3}
              >
                <Box opacity={active ? 1 : 0.85}>
                  <Icon size={18} />
                </Box>
                {!collapsed && (
                  <Text fontSize="sm" fontWeight={active ? 700 : 500}>
                    {item.label}
                  </Text>
                )}
              </HStack>
            </NavLink>
          );
        })}
      </VStack>

      <Divider borderColor="#3b4353" />

      <Button
        onClick={onLogout}
        leftIcon={<LogOut size={16} />}
        justifyContent={collapsed ? "center" : "flex-start"}
        variant="ghost"
        color="#fca5a5"
        rounded="none"
        _hover={{ bg: "#3a2730", color: "#fecaca" }}
        size="sm"
      >
        {!collapsed && "Выйти"}
      </Button>
    </Flex>
  );
}

export default function DashboardLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <Flex minH="100vh" bg="#eef1f4" color="#2b2f36">
      <Box
        display={{ base: "none", lg: "block" }}
        w={collapsed ? "84px" : "290px"}
        transition="width .25s"
      >
        <SidebarContent collapsed={collapsed} onLogout={handleLogout} />
      </Box>

      <Drawer isOpen={isOpen} placement="left" onClose={onClose} size="xs">
        <DrawerOverlay />
        <DrawerContent bg="#2f3542">
          <DrawerBody p={0}>
            <SidebarContent
              collapsed={false}
              onNavigate={onClose}
              onLogout={handleLogout}
            />
          </DrawerBody>
        </DrawerContent>
      </Drawer>

      <Flex direction="column" flex={1} minW={0}>
        <HStack
          px={{ base: 3, md: 5 }}
          py={3}
          borderBottom="1px solid"
          borderColor="#d9dde3"
          bg="#ffffff"
          color="#2b2f36"
          justify="space-between"
          spacing={3}
        >
          <HStack spacing={2} minW={0}>
            <IconButton
              aria-label="Открыть меню"
              icon={<Menu size={18} />}
              display={{ base: "inline-flex", lg: "none" }}
              onClick={onOpen}
              size="sm"
              variant="ghost"
            />
            <IconButton
              aria-label={collapsed ? "Развернуть меню" : "Свернуть меню"}
              icon={collapsed ? <Menu size={18} /> : <X size={18} />}
              display={{ base: "none", lg: "inline-flex" }}
              onClick={() => setCollapsed((v) => !v)}
              size="sm"
              variant="ghost"
            />
          </HStack>
        </HStack>

        <Box p={{ base: 3, md: 5 }} overflowX="auto" flex={1}>
          <Box
            bg="#ffffff"
            border="1px solid"
            borderColor="#d9dde3"
            borderRadius="none"
            p={{ base: 3, md: 5 }}
            minH="calc(100vh - 110px)"
            boxShadow="sm"
          >
            <Outlet />
          </Box>
        </Box>
      </Flex>
    </Flex>
  );
}
