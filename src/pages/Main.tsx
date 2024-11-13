import React, { useContext, useEffect, useState } from 'react';
import { useToken } from './Login';
import { OneDrive } from '../api';

function getPath(i: OneDrive.DriveItem) {
    return i.parentReference.path + "/" + i.name
}

function decodePath(path: string) {
    const ret = []
    for (const element of path.split("/")) {
        ret.push(decodeURIComponent(element))
    }
    return ret.join("\\")
}

const ROOTDIR = "\\drive\\root:"
function relativePath(musicDir: string, file: string) {
    if (file.startsWith(musicDir)) {
        return file.slice(musicDir.length)
    }
    if (file.startsWith(ROOTDIR)) {
        return file.slice(ROOTDIR.length)
    }
    return null
}

export function Main(props: {}) {
    const token = useToken();
    const [musicDir, setMusicDir] = useState<string | null>(null);
    const [playlistPath, setPlaylistPath] = useState<string | null>(null);
    const [playlist, setPlaylist] = useState<string>("");

    useEffect(() => {
        const controller = new AbortController();
        (async () => {
            const musicDirRes = await token.fetchAPI<OneDrive.DriveItem>("/me/drive/special/music", controller.signal);
            const playlistPath = "/me" + getPath(musicDirRes) + "/mymusic.txt";
            setPlaylistPath(playlistPath);
            const data = await token.fetchAPI<OneDrive.DriveItem>(playlistPath, controller.signal);
            const req = await token.fetch(data['@microsoft.graph.downloadUrl'], controller.signal);
            const text = await req.text();
            setMusicDir(decodePath(getPath(musicDirRes)) + "\\");
            setPlaylist(text);
        })();
        return () => {
            controller.abort();
        }
    }, [])

    const [url, setUrl] = useState("/me/drive/special('music')");
    const [data, setData] = useState<{
        folder: OneDrive.DriveItem,
        filelist: OneDrive.DriveItem[],
    } | null>(null);

    function onUP() {
        if (!data) return;
        setUrl("/me/drive/items/" + data.folder.parentReference.id)
    }

    function onClick(item: OneDrive.DriveItem) {
        if (item.folder) {
            setUrl("/me/drive/items/" + item.id)
        }
        if (item.audio) {
            if (!musicDir) return;
            const p = relativePath(musicDir, decodePath(getPath(item)))
            if (!p) return;
            setPlaylist(playlist + p + "\n")
        }
    }

    function onSave() {
        (async () => {
            if (!playlistPath) return;
            await token.fetchAPI<OneDrive.DriveItem>(playlistPath+":/content", undefined, { method: "PUT", body: playlist });
            alert("Saved")
        })();
    }

    useEffect(() => {
        const controller = new AbortController();
        (async () => {
            setData(null)
            const [
                folder,
                filelist
            ] = await Promise.all([
                token.fetchAPI<OneDrive.DriveItem>(url, controller.signal),
                token.fetchAPI<OneDrive.Collection<OneDrive.DriveItem>>(url + "/children", controller.signal)
            ]);
            setData({
                folder: folder,
                filelist: filelist.value,
            });
        })();
        return () => {
            controller.abort();
        }
    }, [url])

    return (
        <div id="page">
            {playlist && (
                <div id="playlist">
                    <textarea id="playlist-text" value={playlist} onChange={(e) => { setPlaylist(e.target.value) }} />
                    <button id="playlist-button" onClick={onSave}>Save</button>
                </div>
            )}
            {data && (
                <div id="filelist">
                    <div onClick={onUP}>{data.folder.name}</div>
                    {data.filelist.map((i) => (
                        <div key={i.id} onClick={() => { onClick(i) }}>
                            {i.name}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
