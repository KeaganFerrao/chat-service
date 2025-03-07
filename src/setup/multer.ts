import Multer from 'multer';

const multer = (sizeInMb: number) => Multer({
    storage: Multer.memoryStorage(),
    limits: {
        fileSize: sizeInMb * 1024 * 1024
    }
});

export default multer;