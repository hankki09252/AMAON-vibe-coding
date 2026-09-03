// Preserve the current player/video deep link when a guest chooses to participate.
export function offerMemberLogin() {
  if (window.confirm("좋아요는 로그인한 회원만 누를 수 있습니다. 로그인 화면으로 이동할까요?")) {
    const returnTo = window.location.pathname + window.location.search + window.location.hash;
    window.location.assign(`/login?returnTo=${encodeURIComponent(returnTo)}`);
  }
}
