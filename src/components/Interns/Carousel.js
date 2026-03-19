import React, { useState, useEffect } from "react";
import { Box, Typography, Container, IconButton } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import ChevronLeftIcon from "@material-ui/icons/ChevronLeft";
import ChevronRightIcon from "@material-ui/icons/ChevronRight";
import { Dialog, DialogContent, DialogActions } from "@material-ui/core";

const useStyles = makeStyles((theme) => ({
  root: {
    width: "100%",
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#ffffff",
    padding: theme.spacing(4, 2),
    fontFamily: "'Poppins', 'Segoe UI', sans-serif",
  },
  container: {
    width: "100%",
    maxWidth: "1100px",
  },
  title2: {
    textAlign: "center",
    fontSize: "2.5rem",
    fontWeight: "800",
    marginBottom: theme.spacing(6),
    background: "linear-gradient(135deg, #FF7704 0%, #ff9f43 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
    textTransform: "uppercase",
    letterSpacing: "-1px",
  },

  /* ── MAIN LAYOUT ── */
  mainWrap: {
    display: "flex",
    alignItems: "center",
    gap: "72px",
  },

  /* ── FAN STACK ── */
  fanWrap: {
    position: "relative",
    width: "380px",
    height: "420px",
    flexShrink: 0,
    marginTop: "-210px",
  },
  fanCard: {
    position: "absolute",
    bottom: "0",
    left: "50%",
    marginLeft: "-100px",
    width: "200px",
    height: "270px",
    borderRadius: "20px",
    overflow: "hidden",
    cursor: "pointer",
    transformOrigin: "50% 130%",
    transition:
      "transform 0.5s cubic-bezier(0.4,0,0.2,1), box-shadow 0.4s, opacity 0.4s",
    boxShadow: "0 6px 20px rgba(0,0,0,0.12)",
    border: "3px solid rgba(255,255,255,0.8)",
    background: "#f0f0f0",
  },
  fanCardActive: {
    border: "3px solid #FF7704 !important",
    boxShadow:
      "0 16px 40px rgba(255,119,4,0.35), 0 4px 16px rgba(0,0,0,0.15) !important",
  },
  fanCardImg: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    display: "block",
    pointerEvents: "none",
  },
  fanCardPlaceholder: {
    width: "100%",
    height: "100%",
    background: "linear-gradient(135deg, #FF7704 0%, #ff9f43 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#fff",
    fontWeight: "800",
    fontSize: "2.5rem",
    fontFamily: "'Poppins', sans-serif",
  },
  fanLabel: {
    position: "absolute",
    bottom: "10px",
    left: "50%",
    transform: "translateX(-50%)",
    background: "rgba(0,0,0,0.6)",
    color: "#fff",
    fontSize: "0.72rem",
    fontWeight: "700",
    padding: "3px 10px",
    borderRadius: "20px",
    whiteSpace: "nowrap",
    pointerEvents: "none",
    letterSpacing: "0.5px",
  },

  /* ── DETAIL CARD ── */
  detailCard: {
    background: "#fff",
    borderRadius: "20px",
    padding: theme.spacing(6),
    boxShadow: "0 15px 50px rgba(0,0,0,0.1)",
    border: "2px solid rgba(0,0,0,0.08)",
    minWidth: "700px",
    marginLeft: "40px",
    animation: "$fadeUp 0.45s ease both",
  },
  "@keyframes fadeUp": {
    from: { opacity: 0, transform: "translateY(14px)" },
    to: { opacity: 1, transform: "translateY(0)" },
  },
  name: {
    fontSize: "2rem",
    fontWeight: "800",
    marginBottom: theme.spacing(1),
    background: "linear-gradient(135deg, #FF7704 0%, #ff9f43 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
  },
  message: {
    fontSize: "0.9rem",
    lineHeight: "1.6",
    color: "#FF7704",
    marginBottom: theme.spacing(1.5),
    fontWeight: "600",
  },
  educationText: {
    fontSize: "0.88rem",
    lineHeight: "1.7",
    color: "#555",
    marginBottom: theme.spacing(2),
  },
  readMoreBtn: {
    background: "linear-gradient(135deg, #FF7704 0%, #ff9f43 100%)",
    color: "#fff",
    fontWeight: "600",
    padding: "10px 20px",
    borderRadius: "8px",
    border: "none",
    cursor: "pointer",
    fontSize: "0.9rem",
    transition: "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
    boxShadow: "0 8px 20px rgba(255,119,4,0.3)",
    marginTop: "8px",
    "&:hover": {
      transform: "translateY(-3px)",
      boxShadow: "0 12px 30px rgba(255,119,4,0.4)",
    },
  },

  /* ── NAV ── */
  navWrap: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    marginTop: theme.spacing(4),
    gap: theme.spacing(2),
  },
  navButton: {
    backgroundColor: "#FF7704",
    color: "#fff",
    padding: theme.spacing(1.5),
    borderRadius: "50%",
    transition: "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
    boxShadow: "0 8px 20px rgba(255,119,4,0.3)",
    "&:hover": {
      backgroundColor: "#ff9f43",
      transform: "scale(1.1) translateY(-4px)",
    },
  },
  dotsWrap: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  dot: {
    width: "10px",
    height: "10px",
    borderRadius: "50%",
    background: "rgba(255,119,4,0.3)",
    cursor: "pointer",
    border: "none",
    padding: 0,
    transition: "all 0.35s ease",
  },
  dotActive: {
    background: "#FF7704",
    width: "28px",
    borderRadius: "5px",
    boxShadow: "0 4px 12px rgba(255,119,4,0.4)",
  },
  counter: {
    fontSize: "0.85rem",
    fontWeight: "600",
    color: "#FF7704",
    textTransform: "uppercase",
    letterSpacing: "1px",
    textAlign: "center",
    marginTop: theme.spacing(2),
  },

  /* ── MODAL ── */
  modalTitle: {
    color: "#FF7704",
    fontSize: "1.8rem",
    fontWeight: "800",
    marginBottom: theme.spacing(2),
    textAlign: "center",
  },
  modalCloseBtn: {
    background: "linear-gradient(135deg, #FF7704 0%, #ff9f43 100%)",
    color: "#fff",
    fontWeight: "600",
    padding: "8px 24px",
    borderRadius: "8px",
    border: "none",
    cursor: "pointer",
    fontSize: "0.95rem",
  },
  modalImgWrap: {
    width: "120px",
    height: "120px",
    borderRadius: "50%",
    overflow: "hidden",
    margin: "0 auto 20px",
    border: "3px solid #FF7704",
    background: "#f0f0f0",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  modalPlaceholder: {
    width: "100%",
    height: "100%",
    background: "linear-gradient(135deg,#FF7704,#ff9f43)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#fff",
    fontWeight: "800",
    fontSize: "2rem",
    fontFamily: "'Poppins',sans-serif",
  },
}));

/* ─── DATA ─── */
const internPhotosBase = `${process.env.PUBLIC_URL || ""}/RADZTECH_INTERNS_NOBG`;

const carouselData = [
  {
    id: 1,
    name: "Kurt",
    message: "Development Intern | Passionate Coder | Problem Solver",
    education:
      "BS Information Technology\nWeb and Mobile Application Development\nIsabela State University – Echague",
    journey:
      "My internship journey at RADZTECH has been transformative. From day one, I was immersed in real-world development projects that challenged me to grow beyond my coding skills. I learned not just how to write code, but how to write elegant, maintainable solutions. The mentorship I received was invaluable, and I've developed a strong foundation in full-stack development.",
    image: `${internPhotosBase}/KURT.png`,
  },
  {
    id: 2,
    name: "Adam",
    message: "Development Intern | Full Stack Enthusiast | Team Player",
    education:
      "BS Information Technology\nWeb and Mobile Application Development\nIsabela State University – Echague",
    journey:
      "Working as a development intern at RADZTECH has been an incredible experience. I've had the chance to work on diverse projects spanning frontend and backend technologies. My team was supportive and always willing to guide me through complex challenges.",
    image: `${internPhotosBase}/ADAM.png`,
  },
  {
    id: 3,
    name: "Brayan",
    message: "Development Intern | Creative Developer | Always Learning",
    education:
      "BS Information Technology\nWeb and Mobile Application Development\nIsabela State University – Echague",
    journey:
      "My time at RADZTECH as a development intern has been eye-opening. I've worked on projects that required creative thinking and technical excellence. The company culture encourages continuous learning and experimentation.",
    image: `${internPhotosBase}/BRAYAN.png`,
  },
  {
    id: 4,
    name: "Merlvin",
    message: "Development Intern | Tech Innovator | Code Quality Focus",
    education:
      "BS Information Technology\nWeb and Mobile Application Development\nIsabela State University – Echague",
    journey:
      "During my internship at RADZTECH, I focused on understanding the importance of code quality and best practices. I participated in code reviews, pair programming sessions, and learned from senior developers.",
    image: `${internPhotosBase}/MERLVIN.png`,
  },
  {
    id: 5,
    name: "Marth",
    message: "Development Intern | Dedicated Developer | Growth Mindset",
    education:
      "BS Information Technology\nWeb and Mobile Application Development\nIsabela State University – Echague",
    journey:
      "My internship at RADZTECH has been a journey of personal and professional growth. Every project taught me something new, and every challenge pushed me to be better.",
    image: `${internPhotosBase}/MARTH.png`,
  },
  {
    id: 6,
    name: "Dean",
    message: "Business Intern | Strategic Thinker | Future Leader",
    education:
      "BS Information Technology\nWeb and Mobile Application Development\nIsabela State University – Echague",
    journey:
      "My journey in the business department at RADZTECH has been enlightening. I've gained insights into market analysis, business strategy, and decision-making processes.",
    image: `${internPhotosBase}/DEAN.png`,
  },
  {
    id: 7,
    name: "Jerick",
    message: "Business Intern | Analytical Mind | Business Developer",
    education:
      "BS Information Technology\nWeb and Mobile Application Development\nIsabela State University – Echague",
    journey:
      "As a business intern at RADZTECH, I've had the opportunity to work on projects that directly impact the company's growth.",
    image: `${internPhotosBase}/JERICK.png`,
  },
  {
    id: 8,
    name: "Justine M.",
    message: "Business Intern | Creative Strategist | Team Builder",
    education:
      "BS Information Technology\nWeb and Mobile Application Development\nIsabela State University – Echague",
    journey:
      "My internship in RADZTECH's business division has been a creative and challenging experience. I worked on strategic initiatives that required innovative thinking and collaboration.",
    image: `${internPhotosBase}/JUSTINE.png`,
  },
  {
    id: 9,
    name: "Diane",
    message: "Business Intern | Problem Solver | Growth Focused",
    education:
      "BS Information Technology\nWeb and Mobile Application Development\nIsabela State University – Echague",
    journey:
      "Working in the business department at RADZTECH taught me how to identify problems and develop solutions that drive growth.",
    image: `${internPhotosBase}/DIANE.png`,
  },
  {
    id: 10,
    name: "Vince",
    message: "Business Intern | Market Analyst | Innovation Driver",
    education:
      "BS Information Technology\nWeb and Mobile Application Development\nIsabela State University – Echague",
    journey:
      "My time as a business intern at RADZTECH focused on market analysis and innovation.",
    image: `${internPhotosBase}/VINCE.png`,
  },
  {
    id: 11,
    name: "Adrian",
    message: "Business Intern | Strategic Planner | Project Manager",
    education:
      "BS Information Technology\nWeb and Mobile Application Development\nIsabela State University – Echague",
    journey:
      "As a business intern, I worked closely with project management and strategic planning teams at RADZTECH.",
    image: `${internPhotosBase}/ADRIAN.png`,
  },
  {
    id: 12,
    name: "Charimaine",
    message: "Operations Intern | Efficiency Expert | Quality Focused",
    education: "BS Management Accounting",
    journey:
      "Working in operations at RADZTECH gave me a comprehensive view of how companies manage resources and maintain quality.",
    image: `${internPhotosBase}/CHARIMAINE.png`,
  },
  {
    id: 13,
    name: "Hyacinth",
    message: "Operations Intern | Organized Leader | Team Coordinator",
    education: "BS Management Accounting",
    journey:
      "My operations internship at RADZTECH focused on team coordination and organizational leadership.",
    image: `${internPhotosBase}/HYACINTH.png`,
  },
  {
    id: 14,
    name: "Kail",
    message: "Operations Intern | Resourceful | Continuous Improvement",
    education: "BS Management Accounting",
    journey:
      "Working in operations at RADZTECH taught me the value of resourcefulness and continuous improvement.",
    image: `${internPhotosBase}/KAIL.png`,
  },
  {
    id: 15,
    name: "Justine C.",
    message: "Operations Intern | Process Optimizer | Detail Oriented",
    education: "BS Management Accounting",
    journey:
      "My operations internship at RADZTECH was focused on process optimization and efficiency. I analyzed workflows, identified bottlenecks, and contributed to process improvements.",
    image: `${internPhotosBase}/CLAIRE.png`,
  },
  {
    id: 16,
    name: "Jannie",
    message: "Operations Intern | System Thinker | Problem Solver",
    education: "BS Management Accounting",
    journey:
      "As an operations intern, I developed a systems-thinking approach to solving operational problems at RADZTECH.",
    image: `${internPhotosBase}/JANNIE.png`,
  },
  {
    id: 17,
    name: "Oliver",
    message: "Operations Intern | Proactive Professional | Dedicated",
    education: "BS Management Accounting",
    journey:
      "My dedication throughout my operations internship at RADZTECH was rewarded with meaningful contributions to operational excellence.",
    image: `${internPhotosBase}/JOHN.png`,
  },
];

/* ─── FAN HELPERS ─── */
const FAN_COUNT = 5;
const FAN_SPREAD = 20; // degrees between cards

function getFanItems(data, center) {
  const half = Math.floor(FAN_COUNT / 2);
  const n = data.length;
  return Array.from({ length: FAN_COUNT }, (_, i) => {
    const offset = i - half;
    const idx = (center + offset + n) % n;
    return { item: data[idx], offset, idx };
  });
}

export default function Carousel() {
  const classes = useStyles();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [openModal, setOpenModal] = useState(false);

  const total = carouselData.length;
  const fanItems = getFanItems(carouselData, currentIndex);
  const slide = carouselData[currentIndex];

  const nextSlide = () => setCurrentIndex((i) => (i + 1) % total);
  const prevSlide = () => setCurrentIndex((i) => (i - 1 + total) % total);

  useEffect(() => {
    const id = setInterval(nextSlide, 8000);
    return () => clearInterval(id);
  }, []);

  return (
    <Box className={classes.root}>
      <Container maxWidth="md" className={classes.container}>
        <Typography className={classes.title2}>Our Interns</Typography>

        <Box className={classes.mainWrap}>
          {/* ── FAN ── */}
          <Box className={classes.fanWrap}>
            {fanItems.map(({ item, offset, idx }) => {
              const angle = offset * FAN_SPREAD;
              const zIndex = FAN_COUNT - Math.abs(offset);
              const scale = 1 - Math.abs(offset) * 0.06;
              const opacity = 1 - Math.abs(offset) * 0.15;
              const isActive = offset === 0;

              return (
                <Box
                  key={`${idx}-${offset}`}
                  className={`${classes.fanCard} ${isActive ? classes.fanCardActive : ""}`}
                  style={{
                    transform: `rotate(${angle}deg) scale(${scale})`,
                    zIndex,
                    opacity,
                  }}
                  onClick={() => setCurrentIndex(idx)}
                >
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.name}
                      className={classes.fanCardImg}
                    />
                  ) : (
                    <Box className={classes.fanCardPlaceholder}>
                      {item.name.charAt(0)}
                    </Box>
                  )}
                  {isActive && (
                    <Box className={classes.fanLabel}>{item.name}</Box>
                  )}
                </Box>
              );
            })}
          </Box>

          {/* ── DETAIL CARD + NAV ── */}
          <Box style={{ display: "flex", flexDirection: "column", flex: 1 }}>
            <Box key={slide.id} className={classes.detailCard}>
              <Typography className={classes.name}>{slide.name}</Typography>
              <Typography className={classes.message}>
                {slide.message}
              </Typography>
              <Typography className={classes.educationText}>
                {slide.education.split("\n").map((line, i) => (
                  <div key={i}>{line}</div>
                ))}
              </Typography>
              <button
                className={classes.readMoreBtn}
                onClick={() => setOpenModal(true)}
              >
                read more
              </button>
            </Box>

            {/* ── NAVIGATION ── */}
            <Box className={classes.navWrap} style={{ marginTop: "24px" }}>
              <IconButton className={classes.navButton} onClick={prevSlide}>
                <ChevronLeftIcon />
              </IconButton>
              <Box className={classes.dotsWrap}>
                {carouselData.map((_, i) => (
                  <Box
                    key={i}
                    component="button"
                    className={`${classes.dot} ${i === currentIndex ? classes.dotActive : ""}`}
                    onClick={() => setCurrentIndex(i)}
                  />
                ))}
              </Box>
              <IconButton className={classes.navButton} onClick={nextSlide}>
                <ChevronRightIcon />
              </IconButton>
            </Box>

            <Typography
              className={classes.counter}
              style={{ marginTop: "12px" }}
            >
              {currentIndex + 1} / {total}
            </Typography>
          </Box>
        </Box>
      </Container>

      {/* ── MODAL ── */}
      <Dialog
        open={openModal}
        onClose={() => setOpenModal(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          style: {
            backgroundColor: "#fff",
            borderRadius: "20px",
            border: "2px solid rgba(0,0,0,0.1)",
            boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
          },
        }}
      >
        <DialogContent style={{ padding: "32px" }}>
          <Box
            style={{
              display: "flex",
              flexDirection: "row",
              gap: "32px",
              alignItems: "flex-start",
            }}
          >
            {/* LEFT: avatar */}
            <Box style={{ flexShrink: 0 }}>
              <Box
                style={{
                  width: "150px",
                  height: "150px",
                  borderRadius: "50%",
                  overflow: "hidden",
                  border: "3px solid #FF7704",
                  background: "#f0f0f0",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {slide.image ? (
                  <img
                    src={slide.image}
                    alt={slide.name}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                ) : (
                  <Box
                    style={{
                      width: "100%",
                      height: "100%",
                      background: "linear-gradient(135deg,#FF7704,#ff9f43)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#fff",
                      fontWeight: "800",
                      fontSize: "3rem",
                      fontFamily: "'Poppins',sans-serif",
                    }}
                  >
                    {slide.name.charAt(0)}
                  </Box>
                )}
              </Box>
            </Box>

            {/* RIGHT: info */}
            <Box style={{ flex: 1, minWidth: 0 }}>
              <Typography
                style={{
                  color: "#FF7704",
                  fontSize: "1.8rem",
                  fontWeight: "800",
                  marginBottom: "8px",
                }}
              >
                {slide.name}
              </Typography>
              <Typography
                style={{
                  color: "#FF7704",
                  fontSize: "0.9rem",
                  fontWeight: "600",
                  lineHeight: "1.8",
                  marginBottom: "12px",
                  whiteSpace: "pre-wrap",
                  paddingBottom: "12px",
                  borderBottom: "1px solid rgba(255,119,4,0.3)",
                }}
              >
                {slide.education}
              </Typography>
              <Typography
                style={{
                  color: "#FF7704",
                  fontSize: "0.9rem",
                  fontWeight: "600",
                  marginBottom: "16px",
                }}
              >
                {slide.message}
              </Typography>
              <Typography
                style={{
                  color: "#555",
                  fontSize: "0.95rem",
                  lineHeight: "1.8",
                }}
              >
                {slide.journey}
              </Typography>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions style={{ padding: "16px 32px 32px" }}>
          <button
            className={classes.modalCloseBtn}
            onClick={() => setOpenModal(false)}
          >
            Close
          </button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
