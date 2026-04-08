import React, { useRef, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  StatusBar,
  Animated,
  Dimensions,
  Image,
} from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { theme } from "../../constants/theme";
import { useTheme } from "../../contexts/ThemeContext";
import { useAuth } from "../../contexts/AuthContext";
import { useLanguage } from "../../contexts/LanguageContext";

interface DrawerProps {
  visible: boolean;
  onClose: () => void;
  onNavigate: (screen: string) => void;
}

const { width } = Dimensions.get("window");

export function Drawer({ visible, onClose, onNavigate }: DrawerProps) {
  const { colors, isDark } = useTheme();
  const { user, syncStatus } = useAuth();
  const { t } = useLanguage();
  const isLoggedIn = !!user;
  const slideAnim = useRef(new Animated.Value(-width)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: true,
          bounciness: 8,
          speed: 12,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: -width,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const getSyncColor = () => {
    if (!user) return colors.textDim;
    switch (syncStatus) {
      case "synced":
        return "#4CAF50";
      case "syncing":
        return theme.colors.primary;
      case "error":
        return "#F44336";
      default:
        return colors.textDim;
    }
  };

  const getSyncText = () => {
    if (!user) return t.notConnected;
    switch (syncStatus) {
      case "synced":
        return t.synced;
      case "syncing":
        return t.syncing;
      case "error":
        return t.syncError;
      default:
        return t.waiting;
    }
  };

  const menuItems = [
    {
      id: "transactions",
      icon: "exchange-alt",
      label: t.transactions,
      iconColor: "#64B5F6",
    },
    {
      id: "budgets",
      icon: "chart-pie",
      label: t.budgets,
      iconColor: "#A5D6A7",
    },
    {
      id: "categories",
      icon: "list-ul",
      label: t.categories,
      iconColor: "#81C784",
    },
    {
      id: "recurring",
      icon: "redo",
      label: t.recurringBills,
      iconColor: "#FFB74D",
    },
    {
      id: "creditCards",
      icon: "credit-card",
      label: t.creditCards,
      iconColor: "#BA68C8",
    },
    {
      id: "piggyBanks",
      icon: "piggy-bank",
      label: t.piggyBanks,
      iconColor: "#FF8A65",
    },
  ];

  const actionItems = [
    {
      id: "settings",
      icon: "cog",
      label: t.settings,
      iconColor: "#9E9E9E",
    },
  ];

  return (
    <>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
      <Modal
        visible={visible}
        transparent={true}
        animationType="none"
        onRequestClose={onClose}
      >
        <View style={styles.overlay}>
          {/* Fundo escuro com fade */}
          <Animated.View style={[styles.backdrop, { opacity: fadeAnim }]}>
            <TouchableOpacity
              style={StyleSheet.absoluteFillObject}
              onPress={onClose}
              activeOpacity={1}
            />
          </Animated.View>

          {/* Drawer lateral com animação */}
          <Animated.View
            style={[
              styles.drawerContainer,
              {
                transform: [{ translateX: slideAnim }],
                borderRightColor: colors.border,
              },
            ]}
          >
            <View style={[styles.drawer, { backgroundColor: colors.surface }]}>
              {/* Cabeçalho */}
              <View
                style={[
                  styles.header,
                  { borderBottomColor: colors.border, borderBottomWidth: 1 },
                ]}
              >
                <View style={styles.logoContainer}>
                  <Image
                    source={require("../../assets/images/icon.png")}
                    style={{ width: 32, height: 32, resizeMode: "contain" }}
                  />
                  <Text style={[styles.logoText, { color: colors.text }]}>
                    Finance Flex
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={onClose}
                  style={[
                    styles.closeButton,
                    {
                      backgroundColor: isDark
                        ? "rgba(255,255,255,0.08)"
                        : "rgba(0,0,0,0.06)",
                    },
                  ]}
                >
                  <FontAwesome5 name="times" size={18} color={colors.textDim} />
                </TouchableOpacity>
              </View>

              {/* Info do usuário com link para portfólio */}
              {isLoggedIn && (
                <TouchableOpacity
                  style={[
                    styles.userSection,
                    { borderBottomColor: colors.border },
                  ]}
                  onPress={() => {
                    onNavigate("sync");
                    onClose();
                  }}
                >
                  <View style={styles.userInfo}>
                    <FontAwesome5
                      name="user-circle"
                      size={32}
                      color={colors.primary}
                    />
                    <View style={styles.userDetails}>
                      <Text
                        style={[styles.userName, { color: colors.text }]}
                        numberOfLines={1}
                      >
                        {user.displayName || t.user}
                      </Text>
                      <Text
                        style={[styles.userEmail, { color: colors.textDim }]}
                        numberOfLines={1}
                      >
                        {user.email}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              )}

              {/* Status de sincronização */}
              <TouchableOpacity
                style={[
                  styles.syncStatusContainer,
                  {
                    backgroundColor: colors.surfaceDark,
                    borderBottomColor: colors.border,
                  },
                ]}
                onPress={() => {
                  onNavigate("sync");
                  onClose();
                }}
              >
                <FontAwesome5 name="cloud" size={14} color={getSyncColor()} />
                <Text
                  style={[styles.syncStatusText, { color: getSyncColor() }]}
                >
                  {getSyncText()}
                </Text>
              </TouchableOpacity>

              {/* Conteúdo do drawer */}
              <ScrollView
                style={styles.content}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
              >
                {/* Menu Principal */}
                <View style={styles.section}>
                  <Text
                    style={[styles.sectionTitle, { color: colors.textDim }]}
                  >
                    {t.mainMenu}
                  </Text>

                  {menuItems.map((item) => (
                    <TouchableOpacity
                      key={item.id}
                      style={styles.menuItem}
                      onPress={() => {
                        onNavigate(item.id);
                        onClose();
                      }}
                      activeOpacity={0.7}
                    >
                      <View style={styles.menuItemContent}>
                        <FontAwesome5
                          name={item.icon}
                          size={18}
                          color={item.iconColor}
                          style={styles.menuItemIcon}
                        />
                        <Text
                          style={[styles.menuItemText, { color: colors.text }]}
                        >
                          {item.label}
                        </Text>
                      </View>
                      <FontAwesome5
                        name="chevron-right"
                        size={16}
                        color={colors.textDim}
                      />
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Divisor */}
                <View
                  style={[styles.divider, { backgroundColor: colors.border }]}
                />

                {/* Configurações */}
                <View style={styles.section}>
                  <Text
                    style={[styles.sectionTitle, { color: colors.textDim }]}
                  >
                    {t.settings}
                  </Text>
                  {actionItems.map((item) => (
                    <TouchableOpacity
                      key={item.id}
                      style={styles.menuItem}
                      onPress={() => {
                        onNavigate(item.id);
                        onClose();
                      }}
                      activeOpacity={0.4}
                    >
                      <View style={styles.menuItemContent}>
                        <FontAwesome5
                          name={item.icon}
                          size={18}
                          color={item.iconColor}
                          style={styles.menuItemIcon}
                        />
                        <Text
                          style={[styles.menuItemText, { color: colors.text }]}
                        >
                          {item.label}
                        </Text>
                      </View>
                      <FontAwesome5
                        name="chevron-right"
                        size={16}
                        color={colors.textDim}
                      />
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Espaço no final */}
                <View style={{ height: 20 }} />
              </ScrollView>
            </View>
          </Animated.View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "transparent",
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
  },
  drawerContainer: {
    width: "80%",
    maxWidth: 320,
    borderRightWidth: 1,
  },
  drawer: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
  },
  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  logoText: {
    fontSize: 18,
    fontWeight: "bold",
  },
  closeButton: {
    padding: 8,
    borderRadius: 20,
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  userSection: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  userDetails: {
    flex: 1,
    justifyContent: "center",
  },
  userName: {
    fontSize: 14,
    fontWeight: "600",
  },
  userEmail: {
    fontSize: 12,
    marginTop: 2,
  },
  syncStatusContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  syncStatusText: {
    fontSize: 14,
    fontWeight: "500",
  },
  syncEmail: {
    flex: 1,
    fontSize: 12,
    textAlign: "right",
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 12,
    marginTop: 16,
    letterSpacing: 1.2,
    textTransform: "uppercase",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    marginBottom: 4,
    borderRadius: 8,
    paddingHorizontal: 8,
  },
  menuItemContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  menuItemIcon: {
    width: 30,
    textAlign: "center",
  },
  menuItemText: {
    fontSize: 15,
    fontWeight: "500",
    marginLeft: 12,
    flex: 1,
  },
  divider: {
    height: 1,
    marginVertical: 8,
    marginHorizontal: 16,
  },
});
