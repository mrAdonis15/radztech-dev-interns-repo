import React, { useState } from "react";
import Card from "@material-ui/core/Card";
import CardActionArea from "@material-ui/core/CardActionArea";
import Typography from "@material-ui/core/Typography";
import Box from "@material-ui/core/Box";
import BusinessIcon from "@material-ui/icons/Business";

function getBizDisplayName(biz) {
  return (
    (biz && biz.name) ||
    (biz && biz.sBiz) ||
    (biz && biz.business && biz.business.name) ||
    (biz && biz.business && biz.business.businessName) ||
    (biz && biz.data && biz.data.name) ||
    (biz && biz.data && biz.data.businessName) ||
    (biz && biz.businessName) ||
    (biz && biz.companyName) ||
    "Business"
  );
}

function getBizAddressLines(biz) {
  const addr1 =
    (biz && biz.Address1) ||
    (biz && biz.address1) ||
    (biz && biz.business && biz.business.Address1) ||
    (biz && biz.business && biz.business.address1) ||
    (biz && biz.data && biz.data.Address1) ||
    (biz && biz.data && biz.data.address1) ||
    "";
  const addr2 =
    (biz && biz.Address2) ||
    (biz && biz.address2) ||
    (biz && biz.business && biz.business.Address2) ||
    (biz && biz.business && biz.business.address2) ||
    (biz && biz.data && biz.data.Address2) ||
    (biz && biz.data && biz.data.address2) ||
    "";
  const str1 = typeof addr1 === "string" ? addr1.trim() : "";
  const str2 = typeof addr2 === "string" ? addr2.trim() : "";
  if (str1 || str2) return [str2, str1].filter(Boolean);
  const raw =
    (biz && biz.address) ||
    (biz && biz.sAddress) ||
    (biz && biz.location) ||
    (biz && biz.business && biz.business.address) ||
    (biz && biz.business && biz.business.location) ||
    (biz && biz.data && biz.data.address) ||
    "";
  const str = typeof raw === "string" ? raw.trim() : "";
  if (!str) return [];
  return str.split(",").map((s) => s.trim()).filter(Boolean);
}

function getBizLogo(biz) {
  const ixImage =
    (biz && biz.ixImage) ||
    (biz && biz.business && biz.business.ixImage) ||
    (biz && biz.data && biz.data.ixImage) ||
    null;
  const direct =
    (biz && biz.image) ||
    (biz && biz.business && biz.business.logo) ||
    (biz && biz.business && biz.business.logoUrl) ||
    (biz && biz.data && biz.data.logo) ||
    (biz && biz.data && biz.data.logoUrl) ||
    (biz && biz.logo) ||
    (biz && biz.logoUrl) ||
    null;
  if (direct && typeof direct === "string" && direct.trim()) return direct.trim();
  if (ixImage != null && typeof ixImage === "string" && ixImage.trim()) {
    const s = ixImage.trim();
    if (s.startsWith("http://") || s.startsWith("https://") || s.startsWith("data:")) return s;
    const base = typeof process !== "undefined" && process.env.REACT_APP_API_BASE ? String(process.env.REACT_APP_API_BASE).replace(/\/$/, "") : "";
    return base ? `${base}/images/${s}` : s;
  }
  return null;
}

export default function BizCard({ biz, onSelect, disabled }) {
  const name = getBizDisplayName(biz);
  const logo = getBizLogo(biz);
  const addressLines = getBizAddressLines(biz);
  const [imageError, setImageError] = useState(false);
  const showPlaceholder = !logo || imageError;

  return (
    <Card className="biz-ui-card" elevation={0}>
      <CardActionArea onClick={() => onSelect(biz)} disabled={disabled} className="biz-ui-card-action">
        <Box className="biz-ui-card-image-container">
          {!showPlaceholder ? (
            <Box
              component="img"
              src={logo}
              alt=""
              className="biz-ui-card-image"
              onError={() => setImageError(true)}
            />
          ) : (
            <Box className="biz-ui-card-image-placeholder">
              <Box className="biz-ui-card-placeholder-circle">
                <BusinessIcon className="biz-ui-card-placeholder-icon" />
              </Box>
            </Box>
          )}
        </Box>
        <Box className="biz-ui-card-details">
          <Typography variant="h6" component="h2" className="biz-ui-card-name">
            {name}
          </Typography>
          {addressLines.length > 0 &&
            addressLines.map((line, i) => (
              <Typography key={i} variant="body2" className="biz-ui-card-address">
                {line}
              </Typography>
            ))}
        </Box>
      </CardActionArea>
    </Card>
  );
}
