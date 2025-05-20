import React from 'react';
import { View, Text, Pressable, SafeAreaView } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../src/store/authContext'
const FooterNavBar = () => {
    const router = useRouter();
    const pathname = usePathname();
    const { defaultRoom } = useAuth();
    const isActive = (path) => pathname === path;


    // Matching icons from the screenshot
    const navItems = [
        {
            name: 'Home',
            icon: 'home-outline',
            activeIcon: 'home',
            path: `/room/${defaultRoom}`
        },
        {
            name: 'Places',
            icon: 'earth-outline',
            activeIcon: 'earth',
            path: '/places'
        },
        {
            name: 'Create', 
            icon: 'add-circle-outline',
            activeIcon: 'add-circle',
            path: '/create-post'
        },
        {
            name: 'Notifications',
            icon: 'notifications-outline',
            activeIcon: 'notifications',
            path: '/notifications'
        },
        {
            name: 'Profile',
            icon: 'person-outline',
            activeIcon: 'person',
            path: '/profile'
        },
    ];

    return (
        <SafeAreaView
            style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                backgroundColor: 'white',
                borderTopWidth: 0.2,
                borderTopColor: '#EEEEEE'
            }}
        >
            <View style={{
                flexDirection: 'row',
                justifyContent: 'space-around',
                paddingTop: 10,
            }}>
                {navItems.map((item) => (
                    
                    <Pressable
                        key={item.name}
                        onPress={() => router.push(item.path)}
                        style={{
                            alignItems: 'center',
                            flex: 1
                        }}
                    >
                        <Ionicons
                            name={isActive(item.path) ? item.activeIcon : item.icon}
                            size={24}
                            color={isActive(item.path) ? "#ef4444" : "#9CA3AF"}
                        />
                        <Text
                            style={{
                                fontSize: 10,
                                marginTop: 2,
                                color: isActive(item.path) ? "#ef4444" : "#9CA3AF"
                            }}
                        >
                            {item.name}
                        </Text>
                    </Pressable>
                ))}
            </View>
        </SafeAreaView>
    );
};

export default FooterNavBar;