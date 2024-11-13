
export namespace OneDrive {
    export type Collection<T> = {
        "@odata.count": number,
        "value": T[],
    }

    export type DriveItem = {
        "@microsoft.graph.downloadUrl": string,
        "createdDateTime": string,
        "cTag": string,
        "description": string,
        "eTag": string,
        "id": string,
        "lastModifiedDateTime": string,
        "name": string,
        "size": number,
        "webUrl": string,
        "parentReference": {
            "driveId": string,
            "driveType": string,
            "id": string,
            "name": string,
            "path": string,
        },
        audio?: {
            "album": string,
            "albumArtist": string,
            "artist": string,
            "bitrate": number,
            "duration": number,
            "hasDrm": boolean,
            "title": string,
            "track": number,
            "year": number
        },
        file?: {
            "mimeType": string,
            "hashes": {
                "quickXorHash": string,
                "sha1Hash": string,
                "sha256Hash": string
            }
        },
        folder?: {
            "childCount": number,
            "view": {
                "viewType": string,
                "sortBy": string,
                "sortOrder": string
            }
        },
    }


    export type Thumbnails = {
        "value": {
            "id": string,
            "large": {
                "height": number,
                "url": string,
                "width": number
            },
            "medium": {
                "height": number,
                "url": string,
                "width": number
            },
            "small": {
                "height": number,
                "url": string,
                "width": number
            }
        }[]
    }
}