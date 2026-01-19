"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import LoadingSpinner from "@/components/console/common/LoadingSpinner";
import NoData from "@/components/console/common/NoData";
import {
    useGetConnectorCount,
    useGetConnectorList,
    useGetMainBoardCount,
    useGetMainBoardList,
} from "@/service/console/main";
import { makeIntComma } from "@/utils/numberUtils";

interface CountList {
    title: string;
    count: number;
}

interface PostList {
    idx: number;
    category: number;
    b_title: string;
    month: string;
    c_name: string;
}

interface ConnectorList {
    user: string | null;
    clientIp: string;
    userAgent: string;
    reg_date: string;
}

export default function Main() {
    const [boardCountList, setBoardCountList] = useState<CountList[]>([]);
    const [boardList, setBoardList] = useState<PostList[]>([]);
    const [connectorCountList, setConnectorCountList] = useState<CountList[]>([]);
    const [connectorList, setConnectorList] = useState<ConnectorList[]>([]);
    const { data: boardCountListData, isLoading: isBoardCountListLoading } = useGetMainBoardCount();
    const { data: boardListData, isLoading: isBoardListLoading } = useGetMainBoardList();
    const { data: connectorCountData, isLoading: isConnectorCountLoading } = useGetConnectorCount();
    const { data: connectorListData, isLoading: isConnectorListLoading } = useGetConnectorList();

    const isLoading =
        isBoardCountListLoading || isBoardListLoading || isConnectorCountLoading || isConnectorListLoading;

    // 최근 게시글 정보 조회
    useEffect(() => {
        if (boardCountListData) {
            const { data } = boardCountListData;
            setBoardCountList([
                { title: "총 게시글", count: data.boardTotalCnt },
                { title: "금일 게시글", count: data.boardTodayCnt },
                { title: "총 댓글", count: data.commentTotalCnt },
                { title: "금일 댓글", count: data.commentTodayCnt },
            ]);
        }
    }, [boardCountListData]);

    // 최근 게시판 조회
    useEffect(() => {
        if (boardListData) {
            const { data } = boardListData;
            setBoardList(data);
        }
    }, [boardListData]);

    // 최근 접속자 정보 조회
    useEffect(() => {
        if (connectorCountData) {
            const { data } = connectorCountData;
            setConnectorCountList([
                { title: "총 가입회원", count: data.memberTotalCnt },
                { title: "금일 가입회원", count: data.memberTodayCnt },
                { title: "총 방문", count: data.logsTotalCnt },
                { title: "금일 방문", count: data.logsTodayCnt },
            ]);
        }
    }, [connectorCountData]);

    // 접속자 이력 조회
    useEffect(() => {
        if (connectorListData) {
            const { data } = connectorListData;
            setConnectorList(data);
        }
    }, [connectorListData]);

    return (
        <>
            {isLoading ? (
                <div className="absolute inset-0 z-[100] size-full">
                    <LoadingSpinner />
                </div>
            ) : (
                <div className="flex justify-between gap-[50px] pr-[20px]">
                    <div className="flex-1">
                        <p className="py-[10px] text-[24px] font-[600]">최근 게시글 정보</p>
                        <ul className="flex rounded-[20px] bg-white p-[40px_12px] shadow-[0_0_8px_0_rgba(0,0,0,0.05)]">
                            {boardCountList.map((item, i) => (
                                <li
                                    key={`board_count_${i}`}
                                    className={`flex flex-1 flex-col items-center gap-[10px]${
                                        i === 0 ? "" : " border-l border-[#D9D9D9]"
                                    }`}
                                >
                                    <p className="text-[18px] font-[500] text-[#666]">{item.title}</p>
                                    <p className="text-[24px] font-[600]">
                                        <strong className="text-[30px]">{makeIntComma(item.count)}</strong> 개
                                    </p>
                                </li>
                            ))}
                        </ul>
                        <div className="mt-[24px] flex flex-col gap-[25px] rounded-[20px] bg-white p-[20px] shadow-[0_0_8px_0_rgba(0,0,0,0.05)]">
                            <p className="text-[20px] font-[500]">최근 게시판 조회</p>
                            <table className="border-t border-[#D9D9D9]">
                                <thead className="border-b border-[#D9D9D9] bg-[#F7F6FB] text-[18px] text-[#666] [&>tr>th]:font-[500]">
                                    <tr>
                                        <th className="p-[18px_4px]">게시판명</th>
                                        <th className="p-[18px_4px]">제목</th>
                                        <th className="p-[18px_4px]">작성일시</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {boardList.length > 0
                                        ? boardList.map((item, i) => (
                                              <tr
                                                  key={`board_${i}`}
                                                  className="border-b border-[#D9D9D9] hover:bg-[#FCFCFE]"
                                              >
                                                  <td className="p-3 text-center text-[#666]">{item.c_name}</td>
                                                  <td className="p-3">
                                                      <Link
                                                          href={`/console/board/post/${item.category}?page=1&search=titlecontents&detail=${item.idx}`}
                                                          className="block truncate"
                                                      >
                                                          {item.b_title}
                                                      </Link>
                                                  </td>
                                                  <td className="p-3 text-center text-[#666]">{item.month}</td>
                                              </tr>
                                          ))
                                        : boardList.length === 0 && (
                                              <tr className="border-b border-[#D9D9D9]">
                                                  <td colSpan={3}>
                                                      <NoData />
                                                  </td>
                                              </tr>
                                          )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                    <div className="flex-1">
                        <p className="py-[10px] text-[24px] font-[600]">최근 접속자 정보</p>
                        <ul className="flex rounded-[20px] bg-white p-[40px_12px] shadow-[0_0_8px_0_rgba(0,0,0,0.05)]">
                            {connectorCountList.map((item, i) => (
                                <li
                                    key={`board_count_${i}`}
                                    className={`flex flex-1 flex-col items-center gap-[10px]${
                                        i === 0 ? "" : " border-l border-[#D9D9D9]"
                                    }`}
                                >
                                    <p className="text-[18px] font-[500] text-[#666]">{item.title}</p>
                                    <p className="text-[24px] font-[600]">
                                        <strong className="text-[30px]">{makeIntComma(item.count)}</strong> 명
                                    </p>
                                </li>
                            ))}
                        </ul>
                        <div className="mt-[24px] flex flex-col gap-[25px] rounded-[20px] bg-white p-[20px] shadow-[0_0_8px_0_rgba(0,0,0,0.05)]">
                            <p className="text-[20px] font-[500]">접속자 이력 조회</p>
                            <table className="border-t border-[#D9D9D9]">
                                <thead className="border-b border-[#D9D9D9] bg-[#F7F6FB] text-[18px] text-[#666] [&>tr>th]:font-[500]">
                                    <tr>
                                        <th className="p-[18px_4px]">접속자</th>
                                        <th className="p-[18px_4px]">접속 IP</th>
                                        <th className="p-[18px_4px]">접속 브라우저</th>
                                        <th className="p-[18px_4px]">접속일시</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {connectorList.length > 0
                                        ? connectorList.map((item, i) => (
                                              <tr
                                                  key={`board_${i}`}
                                                  className="border-b border-[#D9D9D9] text-center text-[#666] hover:bg-[#FCFCFE]"
                                              >
                                                  <td className="p-3">{item.user ?? "-"}</td>
                                                  <td className="p-3">{item.clientIp}</td>
                                                  <td className="truncate p-3">{item.userAgent}</td>
                                                  <td className="p-3">{item.reg_date}</td>
                                              </tr>
                                          ))
                                        : connectorList.length === 0 && (
                                              <tr className="border-b border-[#D9D9D9]">
                                                  <td colSpan={4}>
                                                      <NoData />
                                                  </td>
                                              </tr>
                                          )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
