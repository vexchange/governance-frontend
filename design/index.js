import styled from '@emotion/styled'

import { Modal as BootstrapModal } from 'react-bootstrap'

import colors from './colors'
import theme from './theme'

export const BaseLink = styled.a`
  text-decoration: none;
`

export const BaseInput = styled.input`
  width: ${props => props.inputWidth || '80%'};
  height: 100%;
  font-size: 40px;
  line-height: 64px;
  color: ${colors.primaryText};
  border: none;
  background: none;
  font-family: VCR, sans-serif;

  &:focus {
    color: ${colors.primaryText};
    background: none;
    border: none;
    box-shadow: 0 0 0 0 rgba(255, 255, 255, 0);
    border: rgba(255, 255, 255, 0);
  }
`

export const BaseInputButton = styled.div`
  position: absolute;
  top: 50%;
  transform: translate(-16px, -50%);
  right: 0;
  background: rgba(255, 255, 255, 0.08);
  color: ${colors.primaryText};
  border-radius: 4px;
  padding: 8px;
  height: 32px;
  font-size: 11px;
  line-height: 16px;
  text-align: center;
  letter-spacing: 1.5px;
  cursor: pointer;
  font-family: VCR, sans-serif;
`

export const BaseInputLabel = styled.div`
  font-family: VCR, sans-serif;
  color: ${colors.text};
  font-size: 12px;
  line-height: 16px;
  letter-spacing: 1.5px;
`

export const BaseText = styled.span`
  color: ${colors.text};
  font-family: "Inter", sans-serif;
  font-size: 16px;
  color: white;
`

export const Title = styled.span`
  color: ${props => (props.color ? props.color : colors.primaryText)};
  font-family: VCR, sans-serif;
  font-style: normal;
  font-weight: normal;
  text-transform: uppercase;
  ${props => (props.fontSize ? `font-size: ${props.fontSize}px;` : '')}
  ${props => (props.lineHeight ? `line-height: ${props.lineHeight}px;` : '')}
`

export const Subtitle = styled.span`
  color: ${props => (props.color ? props.color : colors.primaryText)};
  font-family: VCR, sans-serif;
  font-style: normal;
  font-weight: normal;
  font-size: ${props => (props.fontSize ? props.fontSize : 12)}px;
  ${props => (props.lineHeight ? `line-height: ${props.lineHeight}px;` : '')}
  letter-spacing: 1.5px;
  text-transform: uppercase;
`

export const SecondaryText = styled.span`
  font-family: "Inter", sans-serif;
  font-style: normal;
  font-weight: 500;
  font-size: ${props => (props.fontSize ? props.fontSize : 14)}px;
  line-height: ${props => (props.lineHeight ? props.lineHeight : 20)}px;
  color: ${props => (props.color ? props.color : colors.text)};
`

export const PrimaryText = styled(BaseText)`
  font-style: normal;
  font-weight: 500;
  font-size: ${props => (props.fontSize ? props.fontSize : 16)}px;
  line-height: ${props => (props.lineHeight ? props.lineHeight : 24)}px;
  color: ${props => (props.color ? props.color : colors.primaryText)};
`

export const BaseModal = styled(BootstrapModal)`
  backdrop-filter: blur(80px);
  /**
   * Firefox desktop come with default flag to have backdrop-filter disabled
   * Firefox Android also currently has bug where backdrop-filter is not being applied
   * More info: https://bugzilla.mozilla.org/show_bug.cgi?id=1178765
   **/
  @-moz-document url-prefix() {
    background-color: rgba(0, 0, 0, 0.9);
  }

  .modal-content {
    background-color: ${props => props.backgroundColor || colors.background.two};
    border: none;
    border-radius: ${theme.border.radius};

    button.close {
      color: white;
      opacity: 1;

      &:hover {
        opacity: ${theme.hover.opacity};
      }
    }
  }
`

export const BaseUnderlineLink = styled(BaseLink)`
  text-decoration: underline;
  color: ${colors.text};

  &:hover {
    text-decoration: none;
    color: ${colors.text};
  }
`

export const BaseModalHeader = styled(BootstrapModal.Header)`
  border-bottom: unset;
`

export const BaseModalFooter = styled(BootstrapModal.Footer)`
  border-top: unset;
`

export const BaseModalContentColumn = styled.div`
  display: flex;
  justify-content: center;
  z-index: 1;
  margin-top: ${props => (props.marginTop === 'auto' ? props.marginTop : `${props.marginTop === undefined ? 24 : props.marginTop}px`)};
`

export const BaseIndicator = styled.div`
  width: ${props => props.size}px;
  height: ${props => props.size}px;
  border-radius: ${props => props.size / 2}px;
  background: ${props => props.color};
`

export const FloatingContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  padding: 0 16px;
`

export const LogoContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 8px;
  width: 40px;
  height: 40px;
  border-radius: 100px;
  background: ${props => props.color};
`

export const BaseInputContainer = styled.div`
  width: 100%;
  height: 72px;
  background: rgba(255, 255, 255, 0.04);
  border-radius: 4px;
  margin-top: 8px;
  padding: 0 4px;
  border: ${theme.border.width} ${theme.border.style}
    ${props => (props.error ? colors.red : 'transparent')};
  transition: border 0.25s;
`

export const TooltipContainer = styled.div`
  text-align: left;

  .title {
    font-family: VCR,sans-serif;
  }
`
