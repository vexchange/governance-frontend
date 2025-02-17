import styled from '@emotion/styled';

export const Wrapper = styled.table`
  width: 100%;

  thead {
    text-align: left;
    color: #ACACAB;

    th {
      padding-bottom: 10px;
    }
  }

  tbody {
    color: white;
  }

  td {
    padding: 8px 0;
  }

  td[type="num"],
  td[type="addr"] {
    font-family: "VCR", sans-serif;
  }

  td[type="num"] {
    text-align: right;
  }
`;

