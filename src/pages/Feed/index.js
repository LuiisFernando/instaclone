import React, { useState, useEffect, useCallback } from 'react'
import { View, FlatList } from 'react-native';

import LazyImage from '../components/LazyImage'

import { Post, Header, Avatar, Name, Description, Loading } from './styles'

export default function Feed() {
    const [feed, setFeed] = useState([])
    const [page, setPage] = useState(1)
    const [total, setTotal] = useState(0)
    const [loading, setLoading] = useState(false)
    const [refreshing, setRefreshing] = useState(false)
    const [viewable, setViewable] = useState([])

    async function loadPage(pageNumber = page, shouldRefresh = false) {
        if (total && pageNumber > total) return;

        setLoading(true)
        const response = await fetch(
            `http://10.0.2.2:3000/feed?_expand=author&_limit=5&_page=${pageNumber}`
            )
        const data = await response.json()
        const totalItems = response.headers.get('X-Total-Count')

        setTotal(Math.floor(totalItems / 5))
        setFeed(shouldRefresh ? data : [...feed, ...data]) //increment data on feed and not replace
        setPage(pageNumber + 1)
        setLoading(false)
    }

    useEffect(() => {
        loadPage();
    }, []) // with second parameter empty execute only once

    async function refreshList() {
        setRefreshing(true)

        await loadPage(1, true)

        setRefreshing(false)
    }

    // method declared like this to be static and not remount when any set is called
    // it's static
    // setting the id of object when scroll on it
    const handleViewanleChanged = useCallback(({ changed }) => {
        setViewable(changed.map(({ item }) => item.id))
    }, [])

    return (
        <View>
            <FlatList
                data={feed}
                keyExtractor={post => String(post.id)}
                onEndReached={() => loadPage()}
                onEndReachedThreshold={0.1}
                ListFooterComponent={loading && <Loading />}
                onRefresh={refreshList}
                refreshing={refreshing}
                onViewableItemsChanged={handleViewanleChanged}
                viewabilityConfig={{ viewAreaCoveragePercentThreshold: 20 }}
                renderItem={({ item }) => (
                    <Post>
                        <Header>
                            <Avatar source={{ uri: item.author.avatar }} />
                            <Name>{item.author.name}</Name>
                        </Header>

                        <LazyImage
                            shouldLoad={viewable.includes(item.id)}
                            aspectRatio={item.aspectRatio}
                            smallSource={{ uri: item.small }}
                            source={{ uri: item.image }} 
                        />

                        <Description>
                            <Name>{item.author.name}</Name> {item.description}
                        </Description>
                    </Post>
                )}
            />
        </View>
    )
}