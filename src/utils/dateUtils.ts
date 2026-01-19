// 7일 전 날짜 반환
export const getSevenDaysAgo = (): Date => {
    const today = new Date();
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(today.getDate() - 7);
    return sevenDaysAgo;
};

// 1개월 전 날짜 반환
export const getOneMonthAgo = (): Date => {
    const today = new Date();
    const oneMonthAgo = new Date(today);
    oneMonthAgo.setMonth(today.getMonth() - 1);
    return oneMonthAgo;
};

// 3개월 전 날짜 반환
export const getThreeMonthsAgo = (): Date => {
    const today = new Date();
    const threeMonthsAgo = new Date(today);
    threeMonthsAgo.setMonth(today.getMonth() - 3);
    return threeMonthsAgo;
};

// 6개월 전 날짜 반환
export const getSixMonthsAgo = (): Date => {
    const today = new Date();
    const sixMonthsAgo = new Date(today);
    sixMonthsAgo.setMonth(today.getMonth() - 6);
    return sixMonthsAgo;
};

// 현재 날짜 반환
export const getToday = (): Date => {
    return new Date();
};
