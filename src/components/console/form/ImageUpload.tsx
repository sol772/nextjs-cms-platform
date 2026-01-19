import Image from "next/image";
import { useDropzone } from "react-dropzone";
import { twMerge } from "tailwind-merge";
import { v4 as uuidv4 } from "uuid";

import icCloseWhite from "@/assets/images/console/icCloseWhite.svg";
import icPlusSky from "@/assets/images/console/icPlusSky.png";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { CONSOLE_CONFIRM_MESSAGES } from "@/constants/console/messages";
import { usePopupStore } from "@/store/console/usePopupStore";

export type ImgFileData = { idx: string | number; original_name: string; url: string };

interface ImageUploadProps {
    uploadFiles: ImgFileData[];
    setFiles: (file: ImgFileData[]) => void;
    setFilesData: (fileData: File[]) => void;
    boxClassName?: string;
    className?: string;
    accept?: string;
    handleDelt?: (idx: number, file_idx: number | string) => void;
    maxLength?: number;
}

const ImageUpload: React.FC<ImageUploadProps> = ({
    uploadFiles,
    setFiles,
    setFilesData,
    boxClassName,
    className,
    accept,
    handleDelt,
    maxLength = 1,
}) => {
    const { setConfirmPop } = usePopupStore();
    const { getRootProps, getInputProps } = useDropzone({
        accept: accept ? { [accept]: [] } : undefined,
        multiple: true,
        onDrop: acceptedFiles => {
            const files = acceptedFiles.length + uploadFiles.length;

            if (acceptedFiles.length === 0) {
                return;
            } else if (files > maxLength) {
                setConfirmPop(true, CONSOLE_CONFIRM_MESSAGES.MAX_FILES(maxLength), 1);
            } else {
                const newFiles = acceptedFiles.map(file => ({
                    idx: uuidv4(), // 고유한 ID
                    original_name: file.name,
                    url: URL.createObjectURL(file),
                }));

                // 파일 리스트를 업데이트
                setFiles([...uploadFiles, ...newFiles]);

                // 실제 파일 데이터도 업데이트
                setFilesData([...acceptedFiles]);
            }
        },
    });

    // 파일 삭제
    const handleDeltFile = (idx: number, file_idx: number | string) => {
        if (maxLength > 1 && handleDelt) {
            handleDelt(idx, file_idx);
        } else if (maxLength === 1) {
            setFiles([]);
            setFilesData([]);
        }
    };

    return (
        <div className={`flex gap-[10px] ${boxClassName}`}>
            {uploadFiles.length < maxLength && (
                <div {...getRootProps({ className: "dropzone" })}>
                    <div
                        className={twMerge(
                            "size-[100px] bg-[#F2F6FF] border-2 border-dashed border-[#ddd] rounded-[5px]",
                            className,
                        )}
                    >
                        <input {...getInputProps({ className: "hidden" })} />
                        <label className="flex h-full cursor-pointer items-center justify-center">
                            <Image src={icPlusSky} alt="파일첨부" />
                        </label>
                    </div>
                </div>
            )}
            {uploadFiles.length > 0 && (
                <ScrollArea>
                    <ul className="flex w-max gap-[10px]">
                        {uploadFiles.map((file, i) => {
                            return (
                                <li
                                    key={`file_${i}`}
                                    className="relative flex size-[100px] items-center justify-center overflow-hidden rounded-[5px] border border-[#ddd]"
                                >
                                    <img src={file.url} alt="미리보기이미지" className="max-h-full" />
                                    <button
                                        type="button"
                                        className="absolute right-0 top-0 flex size-[25px] items-center justify-center bg-[rgba(0,0,0,0.6)]"
                                        onClick={() => {
                                            handleDeltFile(i, file.idx);
                                        }}
                                    >
                                        <Image src={icCloseWhite} alt="삭제" />
                                    </button>
                                </li>
                            );
                        })}
                    </ul>
                    <ScrollBar orientation="horizontal" />
                </ScrollArea>
            )}
        </div>
    );
};

export default ImageUpload;
