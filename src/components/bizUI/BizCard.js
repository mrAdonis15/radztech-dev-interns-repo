import React from "react";
import Card from "@material-ui/core/Card";
import CardActionArea from "@material-ui/core/CardActionArea";
import CardContent from "@material-ui/core/CardContent";
import Typography from "@material-ui/core/Typography";
import Box from "@material-ui/core/Box";

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

function getBizLogo(biz) {
  return (
    (biz && biz.image) ||
    (biz && biz.business && biz.business.logo) ||
    (biz && biz.business && biz.business.logoUrl) ||
    (biz && biz.data && biz.data.logo) ||
    (biz && biz.data && biz.data.logoUrl) ||
    (biz && biz.logo) ||
    (biz && biz.logoUrl) ||
    null
  );
}

export default function BizCard({ biz, onSelect, disabled }) {
  const name = getBizDisplayName(biz);
  const logo = getBizLogo(biz);

  return (
    <Card className="biz-ui-card" elevation={2}>
      <CardActionArea onClick={() => onSelect(biz)} disabled={disabled}>
        <CardContent>
          <Box display="flex" alignItems="center" flexDirection="column" py={1}>
            {logo && (
              <Box
                component="img"
                src={logo}
                alt=""
                className="biz-ui-card-logo"
                mb={1}
              />
            )}
            <Typography variant="h6" component="h2" align="center" color="textPrimary">
              {name}
            </Typography>
          </Box>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}
