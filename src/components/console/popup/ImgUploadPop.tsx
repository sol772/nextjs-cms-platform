import { AxiosError } from "axios";
import { useEffect, useState } from "react";

import ImgBox from "@/components/console/common/ImgBox";
import LoadingSpinner from "@/components/console/common/LoadingSpinner";
import NoData from "@/components/console/common/NoData";
import Pagination from "@/components/console/common/Pagination";
import ImageUpload, { ImgFileData } from "@/components/console/form/ImageUpload";
import SearchInput from "@/components/console/form/SearchInput";
import ImgUploadContentPop from "@/components/console/popup/ImgUploadContentPop";
import { API_URL } from "@/config/apiConfig";
import { CONSOLE_TOAST_MESSAGES } from "@/constants/console/messages";
import { usePagination } from "@/hooks/common/usePagination";
import { useToast } from "@/hooks/use-toast";
import { useDelCdnFile, useGetCdnFileList, usePostCdnFile } from "@/service/console/menu/category";
import { usePopupStore } from "@/store/console/usePopupStore";
import { calculatePrevPage } from "@/utils/paginationUtils";

interface Item {
    idx: number;
    path: string;
}

export default function ImgUploadPop({ button }: { button?: React.ReactNode }) {
    const [open, setOpen] = useState(false);
    const [items, setItems] = useState<Item[]>([]);
    const [totalCount, setTotalCount] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [searchTxt, setSearchTxt] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [files, setFiles] = useState<ImgFileData[]>([]);
    const [filesData, setFilesData] = useState<File[]>([]);
    const [cacheBuster, setCacheBuster] = useState(Date.now());
    const { currentPage, pages, setCurrentPage } = usePagination({ totalPages, initialPage: 1 });
    const { data: configData, isLoading: isInitialLoading } = useGetCdnFileList(
        "10",
        currentPage.toString(),
        "I",
        {
            enabled: open,
        },
        searchQuery,
    );
    const postCdnFileMutation = usePostCdnFile();
    const delCdnFileMutation = useDelCdnFile();
    const { setConfirmPop } = usePopupStore();
    const { toast } = useToast();

    useEffect(() => {
        setSearchTxt("");
        setSearchQuery("");
        setFiles([]);
        setFilesData([]);
        setCurrentPage(1);
    }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

    // 목록 조회
    useEffect(() => {
        if (configData) {
            const data = configData.data;
            setItems(data.data_list.rows);
            setTotalPages(data.last_page);
            setTotalCount(data.total_count);
        } else {
            setItems([]);
            setTotalPages(1);
            setTotalCount(0);
        }
    }, [configData]); // eslint-disable-line react-hooks/exhaustive-deps

    // 첨부파일 삭제
    const handleDeleteFile = (idx: number) => {
        const newList = [...files];
        newList.splice(idx, 1);
        setFiles(newList);
        const newFileData = [...filesData];
        newFileData.splice(idx, 1);
        setFilesData(newFileData);
    };

    // 링크 복사
    const handleCopyLink = (path: string) => {
        navigator.clipboard.writeText(`${API_URL}/${path}`);
        toast({ title: CONSOLE_TOAST_MESSAGES.LINK_COPIED });
    };

    // 이미지 등록
    const handleUploadImg = (overwrite?: boolean) => {
        if (filesData.length > 0) {
            postCdnFileMutation.mutate(
                { sessions: filesData, fileKind: "I", ...(overwrite && { overwrite: "Y" }) },
                {
                    onSuccess: () => {
                        toast({ title: CONSOLE_TOAST_MESSAGES.IMAGE_UPLOADED });
                        setFiles([]);
                        setFilesData([]);
                        setCacheBuster(Date.now()); // 이미지 캐시 무효화
                    },
                    onError: error => {
                        const axiosError = error as AxiosError<{ message: string }>;
                        const errorMessage =
                            `${axiosError.response?.data?.message} <br /> 이미지를 덮어쓰시겠습니까?` ||
                            "알 수 없는 에러가 발생했습니다.";
                        setConfirmPop(true, errorMessage, 2, () => handleUploadImg(true));
                    },
                },
            );
        }
    };

    // 삭제 확인
    const handleConfirmDelete = (idx: number) => {
        setConfirmPop(true, "이미지를 삭제하시겠습니까?", 2, () => handleDelete(idx), undefined, "", "red");
    };

    // 삭제하기
    const handleDelete = (idx: number) => {
        const body = { idx };
        delCdnFileMutation.mutate(body, {
            onSuccess: () => {
                toast({ title: CONSOLE_TOAST_MESSAGES.DELETED });
                const prevPage = calculatePrevPage(currentPage, items.length);
                setCurrentPage(prevPage);
            },
        });
    };

    // 검색 버튼 클릭
    const handleSearch = () => {
        setSearchQuery(searchTxt);
        setCurrentPage(1);
    };

    return (
        <ImgUploadContentPop open={open} setOpen={setOpen} button={button}>
            <div className="flex flex-col gap-[8px] py-[20px]">
                <div className="flex items-center justify-between">
                    <p className="text-[#666]">이미지추가</p>
                    <p className="text-[14px] text-console-2">최대: 20개</p>
                </div>
                <ImageUpload
                    uploadFiles={files}
                    setFiles={setFiles}
                    setFilesData={setFilesData}
                    accept="image/png, image/jpeg"
                    maxLength={20}
                    handleDelt={idx => handleDeleteFile(idx)}
                />
                <button
                    type="button"
                    className="h-[40px] rounded-[8px] border border-[#DADEE4] font-[500] text-[#666] disabled:bg-[#F8F8F8]"
                    onClick={() => handleUploadImg()}
                    disabled={files.length === 0}
                >
                    추가
                </button>
            </div>
            <div className="flex justify-end pb-[8px]">
                <SearchInput
                    handleClick={handleSearch}
                    placeholder="파일명"
                    value={searchTxt}
                    onChange={e => setSearchTxt(e.target.value)}
                />
            </div>
            {isInitialLoading ? (
                <LoadingSpinner />
            ) : items && items.length > 0 ? (
                <ul className="grid grid-cols-5 gap-[8px]">
                    {items.map((item, i) => (
                        <li key={`cdn_img_${i}`} className="flex flex-col gap-[4px]">
                            <ImgBox
                                src={`${API_URL}/${item.path}?t=${cacheBuster}`}
                                handleDelete={() => {
                                    handleConfirmDelete(item.idx);
                                }}
                            />
                            <p className="text-center text-[14px]">{item.path.split("/").pop()}</p>
                            <button
                                type="button"
                                className="h-[34px] rounded-[8px] bg-[#F6F7FA] text-[#666]"
                                onClick={() => handleCopyLink(item.path)}
                            >
                                링크 복사
                            </button>
                        </li>
                    ))}
                </ul>
            ) : (
                <NoData txt="등록된 이미지가 없습니다." subTxt={false} className="py-[30px]" />
            )}
            {totalCount > 0 && (
                <Pagination
                    totalPages={totalPages}
                    currentPage={currentPage}
                    pages={pages}
                    handleChangePage={setCurrentPage}
                />
            )}
        </ImgUploadContentPop>
    );
}
