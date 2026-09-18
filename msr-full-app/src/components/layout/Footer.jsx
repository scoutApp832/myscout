import React from 'react';

const Footer = () => {
  return (
    <>
      <style>{`
        .dashboard-footer{
          background: linear-gradient(90deg, #002B5C 0%, #003B7A 100%);
          color:#fff;
          padding:15px 25px;
          border-top:4px solid #FFD100;
          box-shadow:0 -3px 12px rgba(0,0,0,.15);
        }

        .footer-content{
          display:flex;
          justify-content:space-between;
          align-items:center;
          max-width:1500px;
          margin:0 auto;
          gap:20px;
          flex-wrap:wrap;
        }

        .footer-content p{
          margin:0;
          font-size:14px;
          font-weight:500;
          color:#f5f5f5;
          letter-spacing:.3px;
          flex:1;
        }

        .footer-content b{
          color:#FFD100;
        }

        .footer-photos{
          display:flex;
          align-items:center;
          gap:12px;
        }

        .footer-photos img{
          width:42px;
          height:42px;
          object-fit:cover;
          border-radius:50%;
          background:#fff;
          border:2px solid #FFD100;
          padding:2px;
          transition:all .3s ease;
          cursor:pointer;
        }

        .footer-photos img:hover{
          transform:translateY(-4px) scale(1.08);
          box-shadow:0 5px 15px rgba(255,209,0,.4);
        }

        @media(max-width:768px){

          .footer-content{
            flex-direction:column;
            text-align:center;
          }

          .footer-content p{
            font-size:13px;
          }

          .footer-photos{
            justify-content:center;
            margin-top:10px;
          }

        }
      `}</style>

      <footer className="dashboard-footer">
        <div className="footer-content">
          <p>
            <b>
              ..........................................................© 2026 MyScout Rwanda (MSR). All Rights Reserved.
            </b>
          </p>

          <div className="footer-photos">
            <img src="/message.jpg" alt="Message" />
            <img src="/flower.jpg" alt="Flower" />
            <img src="/message.jpg" alt="Message" />
            <img src="/flower.jpg" alt="Flower" />
            <img src="/logo.jpg" alt="MSR Logo" />
          </div>
        </div>
      </footer>
    </>
  );
};

export default Footer;