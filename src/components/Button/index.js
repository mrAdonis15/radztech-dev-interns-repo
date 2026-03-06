import { useLocation } from "react-router-dom";
import { Typography } from "@material-ui/core";

function Home() {

const location = useLocation();

let biz = location.state?.biz;

if (!biz) {
  const stored = localStorage.getItem("selectedBiz");
  if (stored) {
    const parsed = JSON.parse(stored);
    biz = parsed?.biz || parsed;
  }
}

return (

<div style={{ textAlign:"center", marginTop:"40px" }}>

{biz && (
<div style={{ marginTop: "20px" }}>

<Typography variant="h5">
{biz.name}
</Typography>

<Typography>
{biz.ad1}
</Typography>

<Typography>
{biz.ad2}
</Typography>

</div>
)}

</div>

);
}

export default Home;